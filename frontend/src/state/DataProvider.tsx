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
  SyncState,
  Task
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
}

export const DataContext = createContext<DataContextValue | undefined>(undefined);

const generateOperationId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const isNavigatorOnline = () => (typeof navigator !== 'undefined' ? navigator.onLine : false);

const sortMembers = (records: MemberRecord[]): MemberRecord[] =>
  [...records].sort((a, b) => a.name.localeCompare(b.name, 'ja'));

const sortMaterials = (records: MaterialRecord[]): MaterialRecord[] =>
  [...records].sort((a, b) => a.name.localeCompare(b.name, 'ja'));

const sortSchedules = (records: Schedule[]): Schedule[] =>
  [...records].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

const sortTasks = (records: Task[]): Task[] =>
  [...records].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

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
    const idRemap = new Map<number, number>();

    for (const op of operations) {
      const refId = idRemap.get(op.refId) ?? op.refId;

      try {
        if (op.entity === 'member') {
          await handleMemberOperation(op, refId, idRemap);
        } else {
          await handleMaterialOperation(op, refId, idRemap);
        }
      } catch (error) {
        console.error('同期処理でエラーが発生しました', error);
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
        const localId = -Date.now();
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
        const localId = -Date.now();
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
      deleteMaterial
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
      deleteMaterial
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

async function handleMemberOperation(
  operation: OperationRecord,
  refId: number,
  idRemap: Map<number, number>
): Promise<void> {
  if (operation.action === 'create') {
    const created = await apiClient.createMember(operation.payload as MemberInput);
    await db.transaction('rw', db.members, db.operations, async () => {
      await db.members.delete(operation.refId);
      await db.members.put({ ...created, syncStatus: 'synced' });
      await db.operations.where('refId').equals(operation.refId).modify({ refId: created.id });
      await db.operations.delete(operation.id);
    });
    idRemap.set(operation.refId, created.id);
    return;
  }

  if (operation.action === 'update') {
    const targetId = refId > 0 ? refId : idRemap.get(refId);
    if (!targetId) {
      await db.operations.delete(operation.id);
      return;
    }
    const updated = await apiClient.updateMember(targetId, operation.payload as MemberUpdateInput);
    await db.transaction('rw', db.members, db.operations, async () => {
      await db.members.put({ ...updated, syncStatus: 'synced' });
      await db.operations.delete(operation.id);
    });
    return;
  }

  if (operation.action === 'delete') {
    const targetId = refId > 0 ? refId : idRemap.get(refId);
    if (!targetId) {
      await db.operations.delete(operation.id);
      return;
    }
    await apiClient.deleteMember(targetId);
    await db.transaction('rw', db.members, db.operations, async () => {
      await db.members.delete(targetId);
      await db.operations.delete(operation.id);
    });
  }
}

async function handleMaterialOperation(
  operation: OperationRecord,
  refId: number,
  idRemap: Map<number, number>
): Promise<void> {
  if (operation.action === 'create') {
    const created = await apiClient.createMaterial(operation.payload as MaterialInput);
    await db.transaction('rw', db.materials, db.operations, async () => {
      await db.materials.delete(operation.refId);
      await db.materials.put({ ...created, syncStatus: 'synced' });
      await db.operations.where('refId').equals(operation.refId).modify({ refId: created.id });
      await db.operations.delete(operation.id);
    });
    idRemap.set(operation.refId, created.id);
    return;
  }

  if (operation.action === 'update') {
    const targetId = refId > 0 ? refId : idRemap.get(refId);
    if (!targetId) {
      await db.operations.delete(operation.id);
      return;
    }
    const updated = await apiClient.updateMaterial(targetId, operation.payload as MaterialUpdateInput);
    await db.transaction('rw', db.materials, db.operations, async () => {
      await db.materials.put({ ...updated, syncStatus: 'synced' });
      await db.operations.delete(operation.id);
    });
    return;
  }

  if (operation.action === 'delete') {
    const targetId = refId > 0 ? refId : idRemap.get(refId);
    if (!targetId) {
      await db.operations.delete(operation.id);
      return;
    }
    await apiClient.deleteMaterial(targetId);
    await db.transaction('rw', db.materials, db.operations, async () => {
      await db.materials.delete(targetId);
      await db.operations.delete(operation.id);
    });
  }
}
