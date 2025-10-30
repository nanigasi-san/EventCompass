import Dexie, { Table } from 'dexie';
import { MaterialRecord, MemberRecord, OperationRecord, Schedule, Task } from '../types';

export class EventCompassDB extends Dexie {
  members!: Table<MemberRecord, number>;
  materials!: Table<MaterialRecord, number>;
  operations!: Table<OperationRecord, string>;
  schedules!: Table<Schedule, number>;
  tasks!: Table<Task, number>;

  constructor() {
    super('eventcompass-db');
    this.version(1).stores({
      members: 'id',
      materials: 'id',
      operations: 'id, createdAt, refId'
    });
    this.version(2)
      .stores({
        members: 'id',
        materials: 'id',
        operations: 'id, createdAt, refId',
        schedules: 'id, event_date',
        tasks: 'id, schedule_id, start_time'
      })
      .upgrade(async (transaction) => {
        await transaction.table('schedules').clear();
        await transaction.table('tasks').clear();
      });
  }
}

export const db = new EventCompassDB();
