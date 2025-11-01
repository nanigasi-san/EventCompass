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
  TaskUpdateInput,
  Todo,
  TodoInput,
  TodoStatus,
  TodoUpdateInput
} from '../types';

interface DataContextValue {
  members: MemberRecord[];
  materials: MaterialRecord[];
  schedules: Schedule[];
  tasks: Task[];
  todos: Todo[];
  syncState: SyncState;
  lastSync: number | null;
  syncNow: () => Promise<void>;
  resetAll: () => Promise<void>;
  createMember: (input: MemberInput) => Promise<void>;
  updateMember: (memberId: number, input: MemberUpdateInput) => Promise<void>;
  deleteMember: (memberId: number) => Promise<void>;
  createMaterial: (input: MaterialInput) => Promise<void>;
  updateMaterial: (materialId: number, input: MaterialUpdateInput) => Promise<void>;
  deleteMaterial: (materialId: number) => Promise<void>;
  createSchedule: (input: ScheduleInput) => Promise<number>;
  createMilestone: (scheduleId: number, input: TaskInput) => Promise<number>;
  createTodo: (input: TodoInput) => Promise<void>;
  updateTodo: (todoId: number, input: TodoUpdateInput) => Promise<void>;
  deleteTodo: (todoId: number) => Promise<void>;
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
  [...records].sort((a, b) => {
    const aTime = new Date(a.start_time).getTime();
    const bTime = new Date(b.start_time).getTime();
    if (aTime === bTime) {
      return a.id - b.id;
    }
    return aTime - bTime;
  });

const sortTodos = (records: Todo[]): Todo[] =>
  [...records].sort((a, b) => {
    const aTime = a.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY;
    if (aTime === bTime) {
      return a.id - b.id;
    }
    return aTime - bTime;
  });

type EntityIdRemap = {
  member: Map<number, number>;
  material: Map<number, number>;
  schedule: Map<number, number>;
  task: Map<number, number>;
  todo: Map<number, number>;
};

const createIdRemap = (): EntityIdRemap => ({
  member: new Map<number, number>(),
  material: new Map<number, number>(),
  schedule: new Map<number, number>(),
  task: new Map<number, number>(),
  todo: new Map<number, number>()
});

const resolveMappedId = (map: Map<number, number>, id: number): number | null => {
  if (id > 0) {
    return id;
  }
  return map.get(id) ?? null;
};

type TaskOperationPayload = TaskInput & { schedule_id: number };
type TodoOperationPayload = TodoInput & { assignee_id?: number | null };

export function DataProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [lastSync, setLastSync] = useState<number | null>(null);

  const loadFromStorage = useCallback(async () => {
    const [storedMembers, storedMaterials, storedSchedules, storedTasks, storedTodos] = await Promise.all([
      db.members.toArray(),
      db.materials.toArray(),
      db.schedules.toArray(),
      db.tasks.toArray(),
      db.todos.toArray()
    ]);
    setMembers(sortMembers(storedMembers));
    setMaterials(sortMaterials(storedMaterials));
    setSchedules(sortSchedules(storedSchedules));
    setTasks(sortTasks(storedTasks));
    setTodos(sortTodos(storedTodos));
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
        } else if (operation.entity === 'todo') {
          await handleTodoOperation(operation, idRemap);
        }
      } catch (error) {
        console.error('保留中の操作の同期中にエラーが発生しました', error);
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
      const [remoteMembers, remoteMaterials, remoteSchedules, remoteTodos] = await Promise.all([
        apiClient.listMembers(),
        apiClient.listMaterials(),
        apiClient.listSchedules(),
        apiClient.listTodos()
      ]);
      const remoteTasksNested = await Promise.all(
        remoteSchedules.map((schedule) => apiClient.listTasks(schedule.id))
      );
      const remoteTasks = remoteTasksNested.flat();
      await db.transaction('rw', db.members, db.materials, db.schedules, db.tasks, db.todos, async () => {
        await db.members.clear();
        await db.materials.clear();
        await db.schedules.clear();
        await db.tasks.clear();
        await db.todos.clear();
        await db.members.bulkPut(
          remoteMembers.map((member) => ({ ...member, syncStatus: 'synced' as const }))
        );
        await db.materials.bulkPut(
          remoteMaterials.map((material) => ({ ...material, syncStatus: 'synced' as const }))
        );
        await db.schedules.bulkPut(remoteSchedules);
        await db.tasks.bulkPut(remoteTasks);
        await db.todos.bulkPut(remoteTodos);
      });
      await loadFromStorage();
      setLastSync(Date.now());
      setSyncState('idle');
    } catch (error) {
      await loadFromStorage();
      setSyncState('error');
    }
  }, [loadFromStorage, syncPendingOperations]);

  const resetAll = useCallback(async () => {
    setSyncState('syncing');
    try {
      await apiClient.reset();
      await db.transaction(
        'rw',
        db.members,
        db.materials,
        db.schedules,
        db.tasks,
        db.todos,
        async () => {
          await db.members.clear();
          await db.materials.clear();
          await db.schedules.clear();
          await db.tasks.clear();
          await db.todos.clear();
        }
      );
      await db.transaction('rw', db.operations, async () => {
        await db.operations.clear();
      });
      await loadFromStorage();
      setLastSync(Date.now());
      setSyncState('idle');
    } catch (error) {
      await loadFromStorage();
      setSyncState('error');
      throw error;
    }
  }, [loadFromStorage]);

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
        await db.todos.where('assignee_id').equals(memberId).modify({ assignee_id: null });
        await loadFromStorage();
        return;
      }

      await db.transaction('rw', db.members, db.operations, async () => {
        if (memberId <= 0) {
          await db.operations.where('refId').equals(memberId).delete();
          await db.members.delete(memberId);
          await db.todos.where('assignee_id').equals(memberId).modify({ assignee_id: null });
          await db.operations
            .filter(
              (pendingOp) =>
                pendingOp.entity === 'todo' &&
                typeof pendingOp.payload === 'object' &&
                pendingOp.payload !== null &&
                'assignee_id' in (pendingOp.payload as Record<string, unknown>) &&
                (pendingOp.payload as TodoOperationPayload).assignee_id === memberId
            )
            .modify((pendingOp) => {
              (pendingOp.payload as TodoOperationPayload).assignee_id = null;
            });
          return;
        }
        await enqueueOperation('member', 'delete', memberId, null);
        await db.members.update(memberId, { syncStatus: 'pending' as const });
        await db.todos.where('assignee_id').equals(memberId).modify({ assignee_id: null });
        await db.operations
          .filter(
            (pendingOp) =>
              pendingOp.entity === 'todo' &&
              typeof pendingOp.payload === 'object' &&
              pendingOp.payload !== null &&
              'assignee_id' in (pendingOp.payload as Record<string, unknown>) &&
              (pendingOp.payload as TodoOperationPayload).assignee_id === memberId
          )
          .modify((pendingOp) => {
            (pendingOp.payload as TodoOperationPayload).assignee_id = null;
          });
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


  const createTodo = useCallback(
    async (input: TodoInput) => {
      const title = input.title.trim();
      if (!title) {
        throw new Error('ToDo のタイトルを入力してください');
      }
      const payload: TodoInput = {
        title,
        description: input.description?.trim() ? input.description.trim() : null,
        due_date: input.due_date?.trim() ? input.due_date : null,
        status: input.status ?? 'pending',
        assignee_id:
          typeof input.assignee_id === 'number' ? input.assignee_id : null
      };

      if (isNavigatorOnline()) {
        const created = await apiClient.createTodo(payload);
        await db.todos.put(created);
      } else {
        const localId = generateLocalId();
        await db.transaction('rw', db.todos, db.operations, async () => {
          const todoRecord = {
            id: localId,
            title: payload.title,
            description: payload.description ?? null,
            due_date: payload.due_date ?? null,
            status: payload.status ?? 'pending',
            assignee_id: typeof payload.assignee_id === 'number' ? payload.assignee_id : null
          } as const;
          await db.todos.put(todoRecord);
          await enqueueOperation('todo', 'create', localId, payload);
        });
      }
      await loadFromStorage();
    },
    [enqueueOperation, loadFromStorage]
  );

  const updateTodo = useCallback(
    async (todoId: number, input: TodoUpdateInput) => {
      const payload: TodoUpdateInput = {};
      if (input.title !== undefined) {
        const title = input.title.trim();
        if (!title) {
          throw new Error('ToDo のタイトルを入力してください');
        }
        payload.title = title;
      }
      if (input.description !== undefined) {
        payload.description = input.description?.trim()
          ? input.description.trim()
          : null;
      }
      if (input.due_date !== undefined) {
        payload.due_date = input.due_date?.trim() ? input.due_date : null;
      }
      if (input.status !== undefined) {
        payload.status = input.status;
      }
      if (input.assignee_id !== undefined) {
        payload.assignee_id = input.assignee_id === null ? null : input.assignee_id;
      }

      if (isNavigatorOnline() && todoId > 0) {
        const updated = await apiClient.updateTodo(todoId, payload);
        await db.todos.put(updated);
        await loadFromStorage();
        return;
      }

      await db.transaction('rw', db.todos, db.operations, async () => {
        const existing = await db.todos.get(todoId);
        if (!existing) {
          return;
        }
        const merged: Todo = { ...existing };
        if (payload.title !== undefined) {
          merged.title = payload.title;
        }
        if (payload.description !== undefined) {
          merged.description = payload.description ?? null;
        }
        if (payload.due_date !== undefined) {
          merged.due_date = payload.due_date ?? null;
        }
        if (payload.status !== undefined) {
          merged.status = payload.status;
        }
        if (payload.assignee_id !== undefined) {
          merged.assignee_id = payload.assignee_id ?? null;
        }
        await db.todos.put(merged);
        await enqueueOperation('todo', 'update', todoId, payload);
      });
      await loadFromStorage();
    },
    [enqueueOperation, loadFromStorage]
  );

  const deleteTodo = useCallback(
    async (todoId: number) => {
      if (isNavigatorOnline() && todoId > 0) {
        await apiClient.deleteTodo(todoId);
        await db.todos.delete(todoId);
        await loadFromStorage();
        return;
      }

      await db.transaction('rw', db.todos, db.operations, async () => {
        if (todoId <= 0) {
          await db.operations.where('refId').equals(todoId).delete();
          await db.todos.delete(todoId);
          return;
        }
        await enqueueOperation('todo', 'delete', todoId, null);
        await db.todos.delete(todoId);
      });
      await loadFromStorage();
    },
    [enqueueOperation, loadFromStorage]
  );

  const value = useMemo(
    () => ({
      members,
      materials,
      schedules,
      tasks,
      todos,
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
      createMilestone,
      createTodo,
      updateTodo,
      deleteTodo,
      resetAll
    }),
    [
      members,
      materials,
      schedules,
      tasks,
      todos,
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
      createMilestone,
      createTodo,
      updateTodo,
      deleteTodo,
      resetAll
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
      await db.todos.where('assignee_id').equals(operation.refId).modify({ assignee_id: created.id });
      await db.operations
        .filter(
          (pendingOp) =>
            pendingOp.entity === 'todo' &&
            typeof pendingOp.payload === 'object' &&
            pendingOp.payload !== null &&
            'assignee_id' in (pendingOp.payload as Record<string, unknown>) &&
            (pendingOp.payload as TodoOperationPayload).assignee_id === operation.refId
        )
        .modify((pendingOp) => {
          (pendingOp.payload as TodoOperationPayload).assignee_id = created.id;
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
      await db.todos.where('assignee_id').equals(operation.refId).modify({ assignee_id: created.id });
      await db.operations
        .filter(
          (pendingOp) =>
            pendingOp.entity === 'todo' &&
            typeof pendingOp.payload === 'object' &&
            pendingOp.payload !== null &&
            'assignee_id' in (pendingOp.payload as Record<string, unknown>) &&
            (pendingOp.payload as TodoOperationPayload).assignee_id === operation.refId
        )
        .modify((pendingOp) => {
          (pendingOp.payload as TodoOperationPayload).assignee_id = created.id;
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
    const resolvedScheduleId = resolveMappedId(idRemap.schedule, payload.schedule_id);
    if (!resolvedScheduleId) {
      throw new Error('スケジュールを解決できずタスクを同期できませんでした');
    }
    const statusValue: TaskStatus = payload.status ?? 'planned';
    const taskPayload: TaskInput = {
      name: payload.name,
      stage: payload.stage,
      start_time: payload.start_time,
      end_time: payload.end_time,
      location: payload.location ?? null,
      status: statusValue,
      note: payload.note ?? null
    };
    const created = await apiClient.createTask(resolvedScheduleId, taskPayload);
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

async function handleTodoOperation(operation: OperationRecord, idRemap: EntityIdRemap): Promise<void> {
  const map = idRemap.todo;

  if (operation.action === 'create') {
    const payload = operation.payload as TodoOperationPayload;
    const assigneeSource = typeof payload.assignee_id === 'number' ? payload.assignee_id : null;
    const resolvedAssignee = assigneeSource !== null ? resolveMappedId(idRemap.member, assigneeSource) : null;
    if (assigneeSource !== null && resolvedAssignee === null) {
      return;
    }
    const statusValue: TodoStatus = (payload.status as TodoStatus) ?? 'pending';
    const todoPayload: TodoInput = {
      title: payload.title,
      description: payload.description ?? null,
      due_date: payload.due_date ?? null,
      status: statusValue,
      assignee_id: resolvedAssignee
    };
    const created = await apiClient.createTodo(todoPayload);
    await db.transaction('rw', db.todos, db.operations, async () => {
      await db.todos.delete(operation.refId);
      await db.todos.put(created);
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
    const payload = operation.payload as TodoUpdateInput;
    const updatePayload: TodoUpdateInput = { ...payload };
    if (payload.assignee_id !== undefined && payload.assignee_id !== null) {
      const resolved = resolveMappedId(idRemap.member, payload.assignee_id);
      if (!resolved) {
        return;
      }
      updatePayload.assignee_id = resolved;
    }
    const updated = await apiClient.updateTodo(targetId, updatePayload);
    await db.transaction('rw', db.todos, db.operations, async () => {
      await db.todos.put(updated);
      await db.operations.delete(operation.id);
    });
    return;
  }

  if (operation.action === 'delete') {
    await apiClient.deleteTodo(targetId);
    await db.transaction('rw', db.todos, db.operations, async () => {
      await db.todos.delete(targetId);
      await db.operations.delete(operation.id);
    });
  }
}
