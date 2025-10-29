import Dexie, { Table } from 'dexie';
import { MaterialRecord, MemberRecord, OperationRecord } from '../types';

export class EventCompassDB extends Dexie {
  members!: Table<MemberRecord, number>;
  materials!: Table<MaterialRecord, number>;
  operations!: Table<OperationRecord, string>;

  constructor() {
    super('eventcompass-db');
    this.version(1).stores({
      members: 'id',
      materials: 'id',
      operations: 'id, createdAt, refId'
    });
  }
}

export const db = new EventCompassDB();
