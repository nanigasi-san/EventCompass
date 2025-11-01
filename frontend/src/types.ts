export interface ContactInfo {
  phone: string | null;
  email: string | null;
  note: string | null;
}

export interface Member {
  id: number;
  name: string;
  part: string;
  position: string;
  contact: ContactInfo;
}

export interface MemberInput {
  name: string;
  part: string;
  position: string;
  contact: ContactInfo;
}

export type MemberUpdateInput = Partial<Omit<MemberInput, 'contact'>> & {
  contact?: ContactInfo;
};

export interface Material {
  id: number;
  name: string;
  part: string;
  quantity: number;
}

export interface MaterialInput {
  name: string;
  part: string;
  quantity: number;
}

export type MaterialUpdateInput = Partial<MaterialInput>;

export interface Schedule {
  id: number;
  name: string;
  event_date: string;
  start_time: string;
  end_time: string;
}

export interface ScheduleInput {
  name: string;
  event_date: string;
  start_time: string;
  end_time: string;
}

export type ScheduleUpdateInput = Partial<ScheduleInput>;

export interface Task {
  id: number;
  schedule_id: number;
  name: string;
  stage: string;
  start_time: string;
  end_time: string;
  location: string | null;
  status: TaskStatus;
  note: string | null;
}

export interface TaskInput {
  name: string;
  stage: string;
  start_time: string;
  end_time: string;
  location?: string | null;
  status?: TaskStatus;
  note?: string | null;
}

export type TaskUpdateInput = Partial<Omit<TaskInput, 'status'>> & { status?: TaskStatus };

export type EntityKind = 'member' | 'material' | 'schedule' | 'task' | 'todo';
export type OperationAction = 'create' | 'update' | 'delete';
export type SyncState = 'idle' | 'syncing' | 'error';

export interface MemberRecord extends Member {
  syncStatus: 'synced' | 'pending';
}

export interface MaterialRecord extends Material {
  syncStatus: 'synced' | 'pending';
}

export interface OperationRecord {
  id: string;
  entity: EntityKind;
  action: OperationAction;
  refId: number;
  payload: unknown;
  createdAt: number;
}

export type TaskStatus = 'planned' | 'in_progress' | 'completed' | 'delayed';


export type TodoStatus = 'pending' | 'in_progress' | 'completed';

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TodoStatus;
  assignee_id: number | null;
}

export interface TodoInput {
  title: string;
  description?: string | null;
  due_date?: string | null;
  status?: TodoStatus;
  assignee_id?: number | null;
}

export type TodoUpdateInput = Partial<Omit<TodoInput, 'status'>> & { status?: TodoStatus };
