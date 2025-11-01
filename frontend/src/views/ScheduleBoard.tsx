import { FormEvent, useEffect, useMemo, useState } from 'react';
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

type PositionedItem = StageGroupItem & {
  left: number;
  width: number;
  alignment: 'start' | 'middle' | 'end';
};

interface TimelineTick {
  label: string;
  position: number;
}

const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit'
});

const formatDateLabel = (schedule: Schedule): string => {
  const date = new Date(schedule.event_date);
  const formatted = date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });
  return formatted.replace('(', ' (');
};

const buildDateTimeWithOffset = (date: string, time: string): string => {
  const [year, month, day] = date.split('-').map((value) => Number(value));
  const [hour, minute] = time.split(':').map((value) => Number(value));
  const dateObj = new Date(year, month - 1, day, hour, minute, 0);
  const offsetMinutes = -dateObj.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absoluteMinutes / 60)).padStart(2, '0');
  const offsetMins = String(absoluteMinutes % 60).padStart(2, '0');
  return `${date}T${time}:00${sign}${offsetHours}:${offsetMins}`;
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

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const createTimelineTicks = (start: Date, end: Date): TimelineTick[] => {
  const ticks: TimelineTick[] = [];
  const duration = end.getTime() - start.getTime();
  if (duration <= 0) {
    return ticks;
  }
  const tick = new Date(start);
  tick.setMinutes(0, 0, 0);
  if (tick.getTime() < start.getTime()) {
    tick.setHours(tick.getHours() + 1);
  }
  while (tick.getTime() < end.getTime()) {
    const position =
      ((tick.getTime() - start.getTime()) / duration) * 100;
    ticks.push({
      label: timeFormatter.format(tick),
      position: clamp(position, 0, 100)
    });
    tick.setHours(tick.getHours() + 1);
  }
  return ticks;
};

export function ScheduleBoard(): JSX.Element {
  const { schedules, tasks, createSchedule, createMilestone } = useDataContext();
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [milestoneName, setMilestoneName] = useState('');
  const [milestoneStage, setMilestoneStage] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');
  const [milestoneTime, setMilestoneTime] = useState('');
  const [milestoneLocation, setMilestoneLocation] = useState('');
  const [milestoneSubmitting, setMilestoneSubmitting] = useState(false);
  const [milestoneError, setMilestoneError] = useState<string | null>(null);

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

  const selectedScheduleEventDate = selectedSchedule?.event_date ?? '';

  useEffect(() => {
    if (selectedScheduleId === null || !selectedScheduleEventDate) {
      setMilestoneDate('');
      return;
    }
    setMilestoneDate(selectedScheduleEventDate);
  }, [selectedScheduleId, selectedScheduleEventDate]);

  const scheduleTasks = useMemo(() => {
    if (selectedScheduleId === null) {
      return [] as Task[];
    }
    return tasks
      .filter((task) => task.schedule_id === selectedScheduleId)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [selectedScheduleId, tasks]);

  const stageOptions = useMemo(() => {
    const stages = new Set<string>();
    tasks.forEach((task) => stages.add(task.stage));
    return Array.from(stages).sort((a, b) => a.localeCompare(b, 'ja'));
  }, [tasks]);

  const stageGroups = useMemo(() => toStageGroups(scheduleTasks), [scheduleTasks]);

  const timeline = useMemo(() => {
    if (!selectedSchedule) {
      return null;
    }
    const start = new Date(selectedSchedule.start_time);
    const end = new Date(selectedSchedule.end_time);
    if (end.getTime() <= start.getTime()) {
      return null;
    }
    const duration = end.getTime() - start.getTime();
    return {
      start,
      end,
      duration,
      ticks: createTimelineTicks(start, end)
    };
  }, [selectedSchedule]);

  const ganttStageGroups = useMemo((): { stage: string; items: PositionedItem[] }[] => {
    if (!timeline) {
      return [];
    }
    const { start, duration } = timeline;
    return stageGroups.map(({ stage, items }) => ({
      stage,
      items: items.map((item) => {
        const startOffset = item.start.getTime() - start.getTime();
        const endOffset = item.end.getTime() - start.getTime();
        const left = clamp((startOffset / duration) * 100, 0, 100);
        if (item.isMilestone) {
          const alignment = left < 12 ? 'start' : left > 88 ? 'end' : 'middle';
          return {
            ...item,
            left,
            width: 0,
            alignment
          } as PositionedItem;
        }
        const rawWidth = ((item.end.getTime() - item.start.getTime()) / duration) * 100;
        const width = clamp(rawWidth, 1.5, 100 - left);
        return {
          ...item,
          left,
          width,
          alignment: 'middle'
        } as PositionedItem;
      })
    }));
  }, [stageGroups, timeline]);

  const handleScheduleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = scheduleName.trim();
    if (!trimmedName) {
      setScheduleError('スケジュール名を入力してください');
      return;
    }
    if (!scheduleDate) {
      setScheduleError('開催日を選択してください');
      return;
    }
    if (!scheduleStartTime || !scheduleEndTime) {
      setScheduleError('開始時刻と終了時刻を入力してください');
      return;
    }
    const startIso = buildDateTimeWithOffset(scheduleDate, scheduleStartTime);
    const endIso = buildDateTimeWithOffset(scheduleDate, scheduleEndTime);
    const startDate = new Date(startIso);
    const endDate = new Date(endIso);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setScheduleError('開始・終了時刻の形式が不正です');
      return;
    }
    if (startDate.getTime() >= endDate.getTime()) {
      setScheduleError('終了時刻は開始時刻より後に設定してください');
      return;
    }

    setScheduleSubmitting(true);
    try {
      const newId = await createSchedule({
        name: trimmedName,
        event_date: scheduleDate,
        start_time: startIso,
        end_time: endIso
      });
      setScheduleName('');
      setScheduleDate('');
      setScheduleStartTime('');
      setScheduleEndTime('');
      setScheduleError(null);
      setSelectedScheduleId(newId);
    } catch (error) {
      setScheduleError(
        error instanceof Error ? error.message : 'スケジュールの追加に失敗しました'
      );
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const handleMilestoneSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSchedule) {
      setMilestoneError('マイルストーンを追加するスケジュールを選択してください');
      return;
    }
    const trimmedName = milestoneName.trim();
    if (!trimmedName) {
      setMilestoneError('マイルストーン名を入力してください');
      return;
    }
    const stage = milestoneStage.trim() || 'マイルストーン';
    if (!milestoneDate) {
      setMilestoneError('日付を指定してください');
      return;
    }
    if (!milestoneTime) {
      setMilestoneError('時刻を設定してください');
      return;
    }
    const locationValue = milestoneLocation.trim();
    const milestoneIso = buildDateTimeWithOffset(milestoneDate, milestoneTime);

    setMilestoneSubmitting(true);
    try {
      await createMilestone(selectedSchedule.id, {
        name: trimmedName,
        stage,
        start_time: milestoneIso,
        end_time: milestoneIso,
        location: locationValue ? locationValue : null,
        status: 'planned',
        note: null
      });
      setMilestoneError(null);
      setMilestoneName('');
      setMilestoneDate(selectedSchedule.event_date);
      setMilestoneTime('');
      setMilestoneLocation('');
    } catch (error) {
      setMilestoneError(
        error instanceof Error ? error.message : 'マイルストーンの追加に失敗しました'
      );
    } finally {
      setMilestoneSubmitting(false);
    }
  };

  return (
    <section className="schedule-board" aria-labelledby="schedule-board-title">
      <header className="schedule-board__header">
        <div>
          <h2 id="schedule-board-title">イベントスケジュール</h2>
          <p className="schedule-board__lead">最新の進行状況をガントチャート形式で確認できます。</p>
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

      <div className="schedule-board__actions">
        <form className="schedule-board__form" onSubmit={handleScheduleSubmit}>
          <h3 className="schedule-board__form-title">スケジュールを追加</h3>
          <div className="schedule-board__form-row">
            <label>
              <span className="schedule-board__label">名称</span>
              <input
                type="text"
                data-testid="schedule-name-input"
                value={scheduleName}
                onChange={(event) => setScheduleName(event.target.value)}
                placeholder="例: 秋祭り 初日"
              />
            </label>
            <label>
              <span className="schedule-board__label">日付</span>
              <input
                type="date"
                data-testid="schedule-date-input"
                value={scheduleDate}
                onChange={(event) => setScheduleDate(event.target.value)}
              />
            </label>
            <label>
              <span className="schedule-board__label">開始時刻</span>
              <input
                type="time"
                data-testid="schedule-start-input"
                value={scheduleStartTime}
                onChange={(event) => setScheduleStartTime(event.target.value)}
              />
            </label>
            <label>
              <span className="schedule-board__label">終了時刻</span>
              <input
                type="time"
                data-testid="schedule-end-input"
                value={scheduleEndTime}
                onChange={(event) => setScheduleEndTime(event.target.value)}
              />
            </label>
            <button type="submit" className="button button-glow" disabled={scheduleSubmitting}>
              追加
            </button>
          </div>
          {scheduleError && (
            <p className="schedule-board__error" role="alert">
              {scheduleError}
            </p>
          )}
        </form>

        <form className="schedule-board__form" onSubmit={handleMilestoneSubmit}>
          <h3 className="schedule-board__form-title">マイルストーンを追加</h3>
          <div className="schedule-board__form-row">
            <label>
              <span className="schedule-board__label">名称</span>
              <input
                type="text"
                data-testid="milestone-name-input"
                value={milestoneName}
                onChange={(event) => setMilestoneName(event.target.value)}
                placeholder="例: 集合"
              />
            </label>
            <label>
              <span className="schedule-board__label">ステージ</span>
              <input
                type="text"
                list="stage-options"
                data-testid="milestone-stage-input"
                value={milestoneStage}
                onChange={(event) => setMilestoneStage(event.target.value)}
                placeholder="ステージ名"
              />
            </label>
            <label>
              <span className="schedule-board__label">日付</span>
              <input
                type="date"
                data-testid="milestone-date-input"
                value={milestoneDate}
                onChange={(event) => setMilestoneDate(event.target.value)}
              />
            </label>
            <label>
              <span className="schedule-board__label">時刻</span>
              <input
                type="time"
                data-testid="milestone-time-input"
                value={milestoneTime}
                onChange={(event) => setMilestoneTime(event.target.value)}
              />
            </label>
            <label>
              <span className="schedule-board__label">場所（任意）</span>
              <input
                type="text"
                data-testid="milestone-location-input"
                value={milestoneLocation}
                onChange={(event) => setMilestoneLocation(event.target.value)}
                placeholder="会場"
              />
            </label>
            <button
              type="submit"
              className="button button-glow"
              disabled={!selectedSchedule || milestoneSubmitting}
            >
              マイルストーン追加
            </button>
          </div>
          {milestoneError && (
            <p className="schedule-board__error" role="alert">
              {milestoneError}
            </p>
          )}
        </form>
        <datalist id="stage-options">
          {stageOptions.map((stage) => (
            <option key={stage} value={stage} />
          ))}
        </datalist>
      </div>

      {!selectedSchedule ? (
        <div className="schedule-board__empty">
          <p>まだスケジュールが登録されていません。追加して表示を開始しましょう。</p>
        </div>
      ) : (
        <div className="schedule-board__body">
          <div className="schedule-board__summary">
            <h3>{selectedSchedule.name}</h3>
            <p>
              <span>{formatDateLabel(selectedSchedule)}</span>{' '}
              {timeline ? (
                <>
                  {timeFormatter.format(timeline.start)} - {timeFormatter.format(timeline.end)}
                </>
              ) : (
                'タイムライン情報を取得できません'
              )}{' '}
              �b {scheduleTasks.length}���̃^�X�N
            </p>
          </div>

          {scheduleTasks.length === 0 ? (
            <div className="schedule-board__empty schedule-board__empty--inline">
              <p>このスケジュールにはマイルストーンが登録されていません。</p>
            </div>
          ) : timeline ? (
            <div className="schedule-gantt">
              <div className="schedule-gantt__axis">
                <span className="schedule-gantt__axis-edge">
                  {timeFormatter.format(timeline.start)}
                </span>
                <div className="schedule-gantt__axis-track">
                  {timeline.ticks.map((tick) => (
                    <div
                      key={tick.label + tick.position}
                      className="schedule-gantt__tick"
                      style={{ left: `${tick.position}%` }}
                    >
                      <span>{tick.label}</span>
                    </div>
                  ))}
                </div>
                <span className="schedule-gantt__axis-edge">
                  {timeFormatter.format(timeline.end)}
                </span>
              </div>

              <div className="schedule-gantt__rows">
                {ganttStageGroups.map(({ stage, items }) => (
                  <div key={stage} className="schedule-gantt__row">
                    <div className="schedule-gantt__row-label">{stage}</div>
                    <div className="schedule-gantt__row-track">
                      {items.map(({ task, start, end, isMilestone, left, width, alignment }) => (
                        isMilestone ? (
                          <div
                            key={task.id}
                            className={`schedule-gantt__milestone schedule-gantt__milestone--${alignment}`}
                            style={{ left: `${left}%` }}
                          >
                            <div className="schedule-gantt__milestone-line" aria-hidden="true" />
                            <div className="schedule-gantt__milestone-badge">
                              <span className="schedule-gantt__milestone-title">
                                {`${timeFormatter.format(start)} ${task.name}`}
                              </span>
                              {task.location && (
                                <span className="schedule-gantt__milestone-note">場所: {task.location}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div
                            key={task.id}
                            className="schedule-gantt__bar"
                            style={{ left: `${left}%`, width: `${width}%` }}
                          >
                            <span className="schedule-gantt__bar-time">
                              {`${timeFormatter.format(start)} - ${timeFormatter.format(end)}`}
                            </span>
                            <span className="schedule-gantt__bar-name">{task.name}</span>
                            {task.location && (
                              <span className="schedule-gantt__bar-note">場所: {task.location}</span>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="schedule-board__empty schedule-board__empty--inline">
              <p>開始時刻と終了時刻の関係が不正なため、タイムラインを表示できません。</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
