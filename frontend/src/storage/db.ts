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
    this.version(3)
      .stores({
        members: 'id',
        materials: 'id',
        operations: 'id, createdAt, refId',
        schedules: 'id, start_time, event_date',
        tasks: 'id, schedule_id, start_time'
      })
      .upgrade(async (transaction) => {
        await transaction
          .table('schedules')
          .toCollection()
          .modify((record: Schedule & { start_time?: string; end_time?: string }) => {
            if (!record.start_time && record.event_date) {
              record.start_time = `${record.event_date}T00:00:00`;
            }
            if (!record.end_time && record.event_date) {
              record.end_time = `${record.event_date}T23:59:59`;
            }
          });
      });
  }
}

export const db = new EventCompassDB();
