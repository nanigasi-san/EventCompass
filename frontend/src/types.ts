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

export type EntityKind = 'member' | 'material';
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
