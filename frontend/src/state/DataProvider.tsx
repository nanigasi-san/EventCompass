import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/client';
import { db } from '../storage/db';
import {
  MaterialInput,
  MaterialRecord,
  MaterialUpdateInput,
  MemberInput,
  MemberRecord,
  MemberUpdateInput,
  OperationAction,
  OperationRecord,
  Schedule,
  ScheduleInput,
  ScheduleUpdateInput,
  SyncState,
  Task,
  TaskInput,
  TaskStatus,
  TaskUpdateInput
} from '../types';

interface DataContextValue {
  members: MemberRecord[];
  materials: MaterialRecord[];
  schedules: Schedule[];
  tasks: Task[];
  syncState: SyncState;
  lastSync: number | null;
  syncNow: () => Promise<void>;
  createMember: (input: MemberInput) => Promise<void>;
  updateMember: (memberId: number, input: MemberUpdateInput) => Promise<void>;
  deleteMember: (memberId: number) => Promise<void>;
  createMaterial: (input: MaterialInput) => Promise<void>;
  updateMaterial: (materialId: number, input: MaterialUpdateInput) => Promise<void>;
  deleteMaterial: (materialId: number) => Promise<void>;
  createSchedule: (input: ScheduleInput) => Promise<number>;
  createMilestone: (scheduleId: number, input: TaskInput) => Promise<number>;
}

export const DataContext = createContext<DataContextValue | undefined>(undefined);

const generateOperationId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const generateLocalId = (): number => -Math.floor(Date.now() + Math.random() * 1000);

const isNavigatorOnline = () => (typeof navigator !== 'undefined' ? navigator.onLine : false);

const sortMembers = (records: MemberRecord[]): MemberRecord[] =>
  [...records].sort((a, b) => a.name.localeCompare(b.name, 'ja'));

const sortMaterials = (records: MaterialRecord[]): MaterialRecord[] =>
  [...records].sort((a, b) => a.name.localeCompare(b.name, 'ja'));

const sortSchedules = (records: Schedule[]): Schedule[] =>
  [...records].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

const sortTasks = (records: Task[]): Task[] =>
  [...records].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

type EntityIdRemap = {
  member: Map<number, number>;
  material: Map<number, number>;
  schedule: Map<number, number>;
  task: Map<number, number>;
};

const createIdRemap = (): EntityIdRemap => ({
  member: new Map<number, number>(),
  material: new Map<number, number>(),
  schedule: new Map<number, number>(),
  task: new Map<number, number>()
});

const resolveMappedId = (map: Map<number, number>, id: number): number | null => {
  if (id > 0) {
    return id;
  }
  return map.get(id) ?? null;
};

type TaskOperationPayload = TaskInput & { schedule_id: number };

export function DataProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [lastSync, setLastSync] = useState<number | null>(null);

  const loadFromStorage = useCallback(async () => {
    const [storedMembers, storedMaterials, storedSchedules, storedTasks] = await Promise.all([
      db.members.toArray(),
      db.materials.toArray(),
      db.schedules.toArray(),
      db.tasks.toArray()
    ]);
    setMembers(sortMembers(storedMembers));
    setMaterials(sortMaterials(storedMaterials));
    setSchedules(sortSchedules(storedSchedules));
    setTasks(sortTasks(storedTasks));
  }, []);

  const syncPendingOperations = useCallback(async () => {
    const operations = await db.operations.orderBy('createdAt').toArray();
    const idRemap = createIdRemap();

    for (const operation of operations) {
      try {
        if (operation.entity === 'member') {
          await handleMemberOperation(operation, idRemap);
        } else if (operation.entity === 'material') {
          await handleMaterialOperation(operation, idRemap);
        } else if (operation.entity === 'schedule') {
          await handleScheduleOperation(operation, idRemap);
        } else if (operation.entity === 'task') {
          await handleTaskOperation(operation, idRemap);
        }
      } catch (error) {
        console.error('���������ŃG���[���������܂���', error);
        throw error;
      }
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!isNavigatorOnline()) {
      await loadFromStorage();
      setSyncState('error');
      return;
    }

    setSyncState('syncing');
    try {
      await syncPendingOperations();
      const [remoteMembers, remoteMaterials, remoteSchedules] = await Promise.all([
        apiClient.listMembers(),
        apiClient.listMaterials(),
        apiClient.listSchedules()
      ]);
      const remoteTasksNested = await Promise.all(
        remoteSchedules.map((schedule) => apiClient.listTasks(schedule.id))
      );
      const remoteTasks = remoteTasksNested.flat();
      await db.transaction('rw', db.members, db.materials, db.schedules, db.tasks, async () => {
        await db.members.clear();
        await db.materials.clear();
        await db.schedules.clear();
        await db.tasks.clear();
        await db.members.bulkPut(
          remoteMembers.map((member) => ({ ...member, syncStatus: 'synced' as const }))
        );
        await db.materials.bulkPut(
          remoteMaterials.map((material) => ({ ...material, syncStatus: 'synced' as const }))
        );
        await db.schedules.bulkPut(remoteSchedules);
        await db.tasks.bulkPut(remoteTasks);
      });
      await loadFromStorage();
      setLastSync(Date.now());
      setSyncState('idle');
    } catch (error) {
      await loadFromStorage();
      setSyncState('error');
    }
  }, [loadFromStorage, syncPendingOperations]);

  useEffect(() => {
    void loadFromStorage();
    if (isNavigatorOnline()) {
      void syncNow();
    }
  }, [loadFromStorage, syncNow]);

  useEffect(() => {
    const handleOnline = () => {
      void syncNow();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncNow]);

  const enqueueOperation = useCallback(
    async (entity: OperationRecord['entity'], action: OperationAction, refId: number, payload: unknown) => {
      const operation: OperationRecord = {
        id: generateOperationId(),
        entity,
        action,
        refId,
        payload,
        createdAt: Date.now()
      };
      await db.operations.add(operation);
    },
    []
  );

  const createMember = useCallback(
    async (input: MemberInput) => {
      if (isNavigatorOnline()) {
        const created = await apiClient.createMember(input);
        await db.members.put({ ...created, syncStatus: 'synced' });
      } else {
        const localId = generateLocalId();
        await db.transaction('rw', db.members, db.operations, async () => {
          await db.members.put({ ...input, id: localId, syncStatus: 'pending' });
          await enqueueOperation('member', 'create', localId, input);
        });
      }
      await loadFromStorage();
    },
    [enqueueOperation, loadFromStorage]
  );

  const updateMember = useCallback(
    async (memberId: number, input: MemberUpdateInput) => {
      if (isNavigatorOnline() && memberId > 0) {
        const updated = await apiClient.updateMember(memberId, input);
        await db.members.put({ ...updated, syncStatus: 'synced' });
        await loadFromStorage();
        return;
      }

      await db.transaction('rw', db.members, db.operations, async () => {
        const existing = await db.members.get(memberId);
        if (!existing) {
          return;
        }
        const merged: MemberRecord = {
          ...existing,
          syncStatus: 'pending'
        };
        if (input.name !== undefined) {
          merged.name = input.name;
        }
        if (input.part !== undefined) {
          merged.part = input.part;
        }
        if (input.position !== undefined) {
          merged.position = input.position;
        }
        if (input.contact !== undefined) {
          merged.contact = input.contact;
        }
        await db.members.put(merged);
        await enqueueOperation('member', 'update', memberId, input);
      });
      await loadFromStorage();
    },
    [enqueueOperation, loadFromStorage]
  );

  const deleteMember = useCallback(
    async (memberId: number) => {
      if (isNavigatorOnline() && memberId > 0) {
        await apiClient.deleteMember(memberId);
        await db.members.delete(memberId);
        await loadFromStorage();
        return;
      }

      await db.transaction('rw', db.members, db.operations, async () => {
        if (memberId <= 0) {
          await db.operations.where('refId').equals(memberId).delete();
          await db.members.delete(memberId);
          return;
        }
        await enqueueOperation('member', 'delete', memberId, null);
        await db.members.update(memberId, { syncStatus: 'pending' as const });
      });
      await loadFromStorage();
    },
    [enqueueOperation, loadFromStorage]
  );

  const createMaterial = useCallback(
    async (input: MaterialInput) => {
      if (isNavigatorOnline()) {
        const created = await apiClient.createMaterial(input);
        await db.materials.put({ ...created, syncStatus: 'synced' });
      } else {
        const localId = generateLocalId();
        await db.transaction('rw', db.materials, db.operations, async () => {
          await db.materials.put({ ...input, id: localId, syncStatus: 'pending' });
          await enqueueOperation('material', 'create', localId, input);
        });
      }
      await loadFromStorage();
    },
    [enqueueOperation, loadFromStorage]
  );

  const updateMaterial = useCallback(
    async (materialId: number, input: MaterialUpdateInput) => {
      if (isNavigatorOnline() && materialId > 0) {
        const updated = await apiClient.updateMaterial(materialId, input);
        await db.materials.put({ ...updated, syncStatus: 'synced' });
        await loadFromStorage();
        return;
      }

      await db.transaction('rw', db.materials, db.operations, async () => {
        const existing = await db.materials.get(materialId);
        if (!existing) {
          return;
        }
        const merged: MaterialRecord = {
          ...existing,
          syncStatus: 'pending'
        };
        if (input.name !== undefined) {
          merged.name = input.name;
        }
        if (input.part !== undefined) {
          merged.part = input.part;
        }
        if (input.quantity !== undefined) {
          merged.quantity = input.quantity;
        }
        await db.materials.put(merged);
        await enqueueOperation('material', 'update', materialId, input);
      });
      await loadFromStorage();
    },
    [enqueueOperation, loadFromStorage]
  );

  const deleteMaterial = useCallback(
    async (materialId: number) => {
      if (isNavigatorOnline() && materialId > 0) {
        await apiClient.deleteMaterial(materialId);
        await db.materials.delete(materialId);
        await loadFromStorage();
        return;
      }

      await db.transaction('rw', db.materials, db.operations, async () => {
        if (materialId <= 0) {
          await db.operations.where('refId').equals(materialId).delete();
          await db.materials.delete(materialId);
          return;
        }
        await enqueueOperation('material', 'delete', materialId, null);
        await db.materials.update(materialId, { syncStatus: 'pending' as const });
      });
      await loadFromStorage();
    },
    [enqueueOperation, loadFromStorage]
  );

  const createSchedule = useCallback(
    async (input: ScheduleInput) => {
      const name = input.name.trim();
      if (!name) {
        throw new Error('スケジュール名を入力してください');
      }
      if (!input.event_date) {
        throw new Error('開催日を選択してください');
      }
      if (!input.start_time || !input.end_time) {
        throw new Error('開始時刻と終了時刻を入力してください');
      }
      const startDate = new Date(input.start_time);
      const endDate = new Date(input.end_time);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        throw new Error('開始・終了時刻の形式が不正です');
      }
      if (startDate.getTime() >= endDate.getTime()) {
        throw new Error('終了時刻は開始時刻より後に設定してください');
      }

      const payload: ScheduleInput = {
        name,
        event_date: input.event_date,
        start_time: input.start_time,
        end_time: input.end_time
      };

      if (isNavigatorOnline()) {
        const created = await apiClient.createSchedule(payload);
        await db.schedules.put(created);
        await loadFromStorage();
        return created.id;
      }

      const localId = generateLocalId();
      await db.transaction('rw', db.schedules, db.operations, async () => {
        await db.schedules.put({ id: localId, ...payload });
        await enqueueOperation('schedule', 'create', localId, payload);
      });
      await loadFromStorage();
      return localId;
    },
    [enqueueOperation, loadFromStorage]
  );

  const createTaskEntry = useCallback(
    async (scheduleId: number, input: TaskInput) => {
      const status: TaskStatus = input.status ?? 'planned';
      const location = input.location ?? null;
      const note = input.note ?? null;
      const payload: TaskInput = {
        ...input,
        status,
        location,
        note
      };

      if (isNavigatorOnline() && scheduleId > 0) {
        const created = await apiClient.createTask(scheduleId, payload);
        await db.tasks.put(created);
        await loadFromStorage();
        return created.id;
      }

      const localId = generateLocalId();
      await db.transaction('rw', db.tasks, db.operations, async () => {
        await db.tasks.put({
          id: localId,
          schedule_id: scheduleId,
          name: input.name,
          stage: input.stage,
          start_time: input.start_time,
          end_time: input.end_time,
          location,
          status,
          note
        });
        const operationPayload: TaskOperationPayload = {
          ...payload,
          schedule_id: scheduleId
        };
        await enqueueOperation('task', 'create', localId, operationPayload);
      });
      await loadFromStorage();
      return localId;
    },
    [enqueueOperation, loadFromStorage]
  );

  const createMilestone = useCallback(
    async (scheduleId: number, input: TaskInput) => {
      if (input.start_time !== input.end_time) {
        throw new Error('マイルストーンは開始時刻と終了時刻を同じにしてください');
      }
      return createTaskEntry(scheduleId, input);
    },
    [createTaskEntry]
  );

  const value = useMemo(
    () => ({
      members,
      materials,
      schedules,
      tasks,
      syncState,
      lastSync,
      syncNow,
      createMember,
      updateMember,
      deleteMember,
      createMaterial,
      updateMaterial,
      deleteMaterial,
      createSchedule,
      createMilestone
    }),
    [
      members,
      materials,
      schedules,
      tasks,
      syncState,
      lastSync,
      syncNow,
      createMember,
      updateMember,
      deleteMember,
      createMaterial,
      updateMaterial,
      deleteMaterial,
      createSchedule,
      createMilestone
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataContext(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('DataContext が提供されていません');
  }
  return ctx;
}

async function handleMemberOperation(operation: OperationRecord, idRemap: EntityIdRemap): Promise<void> {
  const map = idRemap.member;

  if (operation.action === 'create') {
    const created = await apiClient.createMember(operation.payload as MemberInput);
    await db.transaction('rw', db.members, db.operations, async () => {
      await db.members.delete(operation.refId);
      await db.members.put({ ...created, syncStatus: 'synced' });
      await db.operations.where('refId').equals(operation.refId).modify({ refId: created.id });
      await db.operations.delete(operation.id);
    });
    map.set(operation.refId, created.id);
    return;
  }

  const targetId = resolveMappedId(map, operation.refId);
  if (!targetId) {
    await db.operations.delete(operation.id);
    return;
  }

  if (operation.action === 'update') {
    const updated = await apiClient.updateMember(targetId, operation.payload as MemberUpdateInput);
    await db.transaction('rw', db.members, db.operations, async () => {
      await db.members.put({ ...updated, syncStatus: 'synced' });
      await db.operations.delete(operation.id);
    });
    return;
  }

  if (operation.action === 'delete') {
    await apiClient.deleteMember(targetId);
    await db.transaction('rw', db.members, db.operations, async () => {
      await db.members.delete(targetId);
      await db.operations.delete(operation.id);
    });
  }
}

async function handleMaterialOperation(operation: OperationRecord, idRemap: EntityIdRemap): Promise<void> {
  const map = idRemap.material;

  if (operation.action === 'create') {
    const created = await apiClient.createMaterial(operation.payload as MaterialInput);
    await db.transaction('rw', db.materials, db.operations, async () => {
      await db.materials.delete(operation.refId);
      await db.materials.put({ ...created, syncStatus: 'synced' });
      await db.operations.where('refId').equals(operation.refId).modify({ refId: created.id });
      await db.operations.delete(operation.id);
    });
    map.set(operation.refId, created.id);
    return;
  }

  const targetId = resolveMappedId(map, operation.refId);
  if (!targetId) {
    await db.operations.delete(operation.id);
    return;
  }

  if (operation.action === 'update') {
    const updated = await apiClient.updateMaterial(targetId, operation.payload as MaterialUpdateInput);
    await db.transaction('rw', db.materials, db.operations, async () => {
      await db.materials.put({ ...updated, syncStatus: 'synced' });
      await db.operations.delete(operation.id);
    });
    return;
  }

  if (operation.action === 'delete') {
    await apiClient.deleteMaterial(targetId);
    await db.transaction('rw', db.materials, db.operations, async () => {
      await db.materials.delete(targetId);
      await db.operations.delete(operation.id);
    });
  }
}

async function handleScheduleOperation(operation: OperationRecord, idRemap: EntityIdRemap): Promise<void> {
  const map = idRemap.schedule;

  if (operation.action === 'create') {
    const created = await apiClient.createSchedule(operation.payload as ScheduleInput);
    await db.transaction('rw', db.schedules, db.tasks, db.operations, async () => {
      await db.schedules.delete(operation.refId);
      await db.schedules.put(created);
      await db.tasks.where('schedule_id').equals(operation.refId).modify({ schedule_id: created.id });
      await db.operations.where('refId').equals(operation.refId).modify({ refId: created.id });
      await db.operations
        .filter(
          (queuedOp) =>
            queuedOp.entity === 'task' &&
            typeof queuedOp.payload === 'object' &&
            queuedOp.payload !== null &&
            'schedule_id' in (queuedOp.payload as Record<string, unknown>) &&
            (queuedOp.payload as TaskOperationPayload).schedule_id === operation.refId
        )
        .modify((queuedOp) => {
          (queuedOp.payload as TaskOperationPayload).schedule_id = created.id;
        });
      await db.operations.delete(operation.id);
    });
    map.set(operation.refId, created.id);
    return;
  }

  const targetId = resolveMappedId(map, operation.refId);
  if (!targetId) {
    await db.operations.delete(operation.id);
    return;
  }

  if (operation.action === 'update') {
    const updated = await apiClient.updateSchedule(targetId, operation.payload as ScheduleUpdateInput);
    await db.transaction('rw', db.schedules, db.operations, async () => {
      await db.schedules.put(updated);
      await db.operations.delete(operation.id);
    });
    return;
  }

  if (operation.action === 'delete') {
    await apiClient.deleteSchedule(targetId);
    await db.transaction('rw', db.schedules, db.tasks, db.operations, async () => {
      await db.schedules.delete(targetId);
      await db.tasks.where('schedule_id').equals(targetId).delete();
      await db.operations.delete(operation.id);
    });
  }
}

async function handleTaskOperation(operation: OperationRecord, idRemap: EntityIdRemap): Promise<void> {
  const map = idRemap.task;

  if (operation.action === 'create') {
    const payload = operation.payload as TaskOperationPayload;
    const scheduleId = resolveMappedId(idRemap.schedule, payload.schedule_id);
    if (!scheduleId) {
      throw new Error('スケジュールを解決できずタスクを同期できませんでした');
    }
    const status: TaskStatus = payload.status ?? 'planned';
    const taskPayload: TaskInput = {
      name: payload.name,
      stage: payload.stage,
      start_time: payload.start_time,
      end_time: payload.end_time,
      location: payload.location ?? null,
      status,
      note: payload.note ?? null
    };
    const created = await apiClient.createTask(scheduleId, taskPayload);
    await db.transaction('rw', db.tasks, db.operations, async () => {
      await db.tasks.delete(operation.refId);
      await db.tasks.put(created);
      await db.operations.where('refId').equals(operation.refId).modify({ refId: created.id });
      await db.operations.delete(operation.id);
    });
    map.set(operation.refId, created.id);
    return;
  }

  const targetId = resolveMappedId(map, operation.refId);
  if (!targetId) {
    await db.operations.delete(operation.id);
    return;
  }

  if (operation.action === 'update') {
    const updated = await apiClient.updateTask(targetId, operation.payload as TaskUpdateInput);
    await db.transaction('rw', db.tasks, db.operations, async () => {
      await db.tasks.put(updated);
      await db.operations.delete(operation.id);
    });
    return;
  }

  if (operation.action === 'delete') {
    await apiClient.deleteTask(targetId);
    await db.transaction('rw', db.tasks, db.operations, async () => {
      await db.tasks.delete(targetId);
      await db.operations.delete(operation.id);
    });
  }
}


