import { useEffect, useMemo, useState } from 'react';
import { useDataContext } from '../state/DataProvider';
import { Schedule, Task } from '../types';

interface StageGroupItem {
  task: Task;
  start: Date;
  end: Date;
  isMilestone: boolean;
}

interface StageGroup {
  stage: string;
  items: StageGroupItem[];
}

const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit'
});

const formatDateLabel = (schedule: Schedule): string => {
  const date = new Date(schedule.event_date);
  const weekday = date.toLocaleDateString('ja-JP', { weekday: 'short' });
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 (${weekday})`;
};

const toStageGroups = (tasks: Task[]): StageGroup[] => {
  const groups = new Map<string, StageGroupItem[]>();

  tasks.forEach((task) => {
    const start = new Date(task.start_time);
    const end = new Date(task.end_time);
    const item: StageGroupItem = {
      task,
      start,
      end,
      isMilestone: start.getTime() === end.getTime()
    };

    const stageItems = groups.get(task.stage) ?? [];
    stageItems.push(item);
    groups.set(task.stage, stageItems);
  });

  return Array.from(groups.entries())
    .map(([stage, items]) => ({
      stage,
      items: items.sort((a, b) => a.start.getTime() - b.start.getTime())
    }))
    .sort((a, b) => a.stage.localeCompare(b.stage, 'ja'));
};

export function ScheduleBoard(): JSX.Element {
  const { schedules, tasks } = useDataContext();
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  useEffect(() => {
    if (!schedules.length) {
      setSelectedScheduleId(null);
      return;
    }
    if (selectedScheduleId === null) {
      setSelectedScheduleId(schedules[0].id);
      return;
    }
    const exists = schedules.some((schedule) => schedule.id === selectedScheduleId);
    if (!exists) {
      setSelectedScheduleId(schedules[0].id);
    }
  }, [schedules, selectedScheduleId]);

  const selectedSchedule = useMemo(() => {
    if (selectedScheduleId === null) {
      return null;
    }
    return schedules.find((schedule) => schedule.id === selectedScheduleId) ?? null;
  }, [schedules, selectedScheduleId]);

  const scheduleTasks = useMemo(() => {
    if (selectedScheduleId === null) {
      return [] as Task[];
    }
    return tasks
      .filter((task) => task.schedule_id === selectedScheduleId)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [selectedScheduleId, tasks]);

  const stageGroups = useMemo(() => toStageGroups(scheduleTasks), [scheduleTasks]);

  return (
    <section className="schedule-board" aria-labelledby="schedule-board-title">
      <header className="schedule-board__header">
        <div>
          <h2 id="schedule-board-title">イベントスケジュール</h2>
          <p className="schedule-board__lead">その日の流れをシンプルに確認できます。</p>
        </div>
        <label className="schedule-board__select">
          <span className="visually-hidden">表示するスケジュールを選択</span>
          <select
            value={selectedScheduleId ?? ''}
            onChange={(event) => setSelectedScheduleId(Number(event.target.value) || null)}
          >
            {schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {formatDateLabel(schedule)}
              </option>
            ))}
          </select>
        </label>
      </header>

      {!selectedSchedule ? (
        <div className="schedule-board__empty">
          <p>まだスケジュールがありません。同期して予定を取り込みましょう。</p>
        </div>
      ) : scheduleTasks.length === 0 ? (
        <div className="schedule-board__empty">
          <p>この日のイベントは登録されていません。</p>
        </div>
      ) : (
        <div className="schedule-board__body">
          <div className="schedule-board__summary">
            <h3>{formatDateLabel(selectedSchedule)}</h3>
            <p>{stageGroups.length}件のステージが予定されています。</p>
          </div>
          {stageGroups.map(({ stage, items }) => (
            <section key={stage} className="schedule-stage">
              <h4 className="schedule-stage__title">{stage}</h4>
              <ul className="schedule-stage__list">
                {items.map(({ task, start, end, isMilestone }) => (
                  <li
                    key={task.id}
                    className={`schedule-task${isMilestone ? ' schedule-task--milestone' : ''}`}
                  >
                    <div className="schedule-task__time">
                      {isMilestone
                        ? `${timeFormatter.format(start)} マイルストン`
                        : `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`}
                    </div>
                    <div className="schedule-task__detail">
                      <p className="schedule-task__name">{task.name}</p>
                      {task.location && <p className="schedule-task__note">場所: {task.location}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
