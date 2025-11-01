import type { ContextType } from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ScheduleBoard } from '../ScheduleBoard';
import { DataContext } from '../../state/DataProvider';
import { MaterialRecord, MemberRecord, Schedule, Task } from '../../types';

type ContextOverrides = Partial<ContextType<typeof DataContext>>;

const baseMembers: MemberRecord[] = [];
const baseMaterials: MaterialRecord[] = [];

const baseSchedules: Schedule[] = [
  {
    id: 1,
    name: 'Autumn Festival Day 1',
    event_date: '2024-08-10',
    start_time: '2024-08-10T06:00:00+09:00',
    end_time: '2024-08-10T18:00:00+09:00'
  }
];

const baseTasks: Task[] = [
  {
    id: 10,
    schedule_id: 1,
    name: 'Stage preparation',
    stage: 'Stage A',
    start_time: '2024-08-10T08:00:00+09:00',
    end_time: '2024-08-10T08:45:00+09:00',
    location: 'Main stage backstage',
    status: 'planned',
    note: null
  },
  {
    id: 12,
    schedule_id: 1,
    name: 'Opening announcement',
    stage: 'Stage B',
    start_time: '2024-08-10T09:30:00+09:00',
    end_time: '2024-08-10T09:30:00+09:00',
    location: null,
    status: 'planned',
    note: null
  }
];

const defaultContext = {
  members: baseMembers,
  materials: baseMaterials,
  schedules: baseSchedules,
  tasks: baseTasks,
  todos: [],
  syncState: 'idle' as const,
  lastSync: null,
  syncNow: vi.fn(),
  resetAll: vi.fn(),
  createMember: vi.fn(),
  updateMember: vi.fn(),
  deleteMember: vi.fn(),
  createMaterial: vi.fn(),
  updateMaterial: vi.fn(),
  deleteMaterial: vi.fn(),
  createSchedule: vi.fn(async () => 1),
  createMilestone: vi.fn(async () => 100),
  createTodo: vi.fn(async () => {}),
  updateTodo: vi.fn(async () => {}),
  deleteTodo: vi.fn(async () => {})
};

function renderScheduleBoard(overrides: ContextOverrides = {}) {
  const value = { ...defaultContext, ...overrides } as ContextType<typeof DataContext>;
  return render(
    <DataContext.Provider value={value}>
      <ScheduleBoard />
    </DataContext.Provider>
  );
}

describe('ScheduleBoard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders tasks in a Gantt-style timeline', () => {
    renderScheduleBoard();

    expect(screen.getByText(/イベントスケジュール/)).toBeInTheDocument();
    expect(screen.getByText('Stage A')).toBeInTheDocument();
    expect(screen.getByText('Stage B')).toBeInTheDocument();
    expect(screen.getByText('Stage preparation')).toBeInTheDocument();
    expect(screen.getByText(/Main stage backstage/)).toBeInTheDocument();
    expect(screen.getByText('08:00 - 08:45')).toBeInTheDocument();
    expect(screen.getByText(/09:30/)).toBeInTheDocument();
  });

  it('shows an empty state when no schedules exist', () => {
    renderScheduleBoard({ schedules: [], tasks: [] });

    expect(
      screen.getByText(/まだスケジュールが登録されていません。追加して表示を開始しましょう。/)
    ).toBeInTheDocument();
  });

  it('still renders schedule details when no milestones are registered yet', () => {
    renderScheduleBoard({ tasks: [] });

    expect(screen.getByRole('heading', { name: baseSchedules[0].name })).toBeInTheDocument();
    expect(
      screen.getByText('このスケジュールにはマイルストーンが登録されていません。')
    ).toBeInTheDocument();
  });

  it('submits the schedule form and calls createSchedule', async () => {
    const schedules: Schedule[] = [...baseSchedules];
    const createSchedule = vi.fn(
      async (input: { name: string; event_date: string; start_time: string; end_time: string }) => {
        const newSchedule: Schedule = {
          id: 2,
          ...input
        };
        schedules.push(newSchedule);
        return newSchedule.id;
      }
    );
    const user = userEvent.setup();
    renderScheduleBoard({ schedules, createSchedule });

    const form = screen.getByText('スケジュールを追加').closest('form') as HTMLFormElement;
    const utils = within(form);

    const nameInput = utils.getByTestId('schedule-name-input') as HTMLInputElement;
    const dateInput = utils.getByTestId('schedule-date-input') as HTMLInputElement;
    const startInput = utils.getByTestId('schedule-start-input') as HTMLInputElement;
    const endInput = utils.getByTestId('schedule-end-input') as HTMLInputElement;

    await user.type(nameInput, 'Test Schedule');
    await user.type(dateInput, '2024-12-24');
    await user.type(startInput, '10:00');
    await user.type(endInput, '12:30');
    await act(async () => {
      await user.click(utils.getByRole('button', { name: '追加' }));
    });

    await waitFor(() =>
      expect(createSchedule).toHaveBeenCalledWith({
        name: 'Test Schedule',
        event_date: '2024-12-24',
        start_time: expect.stringContaining('2024-12-24T10:00:00'),
        end_time: expect.stringContaining('2024-12-24T12:30:00')
      })
    );
    expect(nameInput.value).toBe('');
    expect(startInput.value).toBe('');
    expect(endInput.value).toBe('');
  });

  it('submits the milestone form and calls createMilestone', async () => {
    const tasks: Task[] = [...baseTasks];
    const createMilestone = vi.fn(
      async (
        scheduleId: number,
        input: {
          name: string;
          stage: string;
          start_time: string;
          end_time: string;
          location: string | null;
          status?: string;
          note: string | null;
        }
      ) => {
        const createdTask: Task = {
          id: tasks.length + 100,
          schedule_id: scheduleId,
          name: input.name,
          stage: input.stage,
          start_time: input.start_time,
          end_time: input.end_time,
          location: input.location,
          status: (input.status as Task['status']) ?? 'planned',
          note: input.note
        };
        tasks.push(createdTask);
        return createdTask.id;
      }
    );
    const user = userEvent.setup();
    renderScheduleBoard({ tasks, createMilestone });

    const form = screen.getByText('マイルストーンを追加').closest('form') as HTMLFormElement;
    const utils = within(form);

    const milestoneNameInput = utils.getByTestId('milestone-name-input') as HTMLInputElement;
    const milestoneStageInput = utils.getByTestId('milestone-stage-input') as HTMLInputElement;
    const milestoneDateInput = utils.getByTestId('milestone-date-input') as HTMLInputElement;
    const milestoneTimeInput = utils.getByTestId('milestone-time-input') as HTMLInputElement;
    const milestoneLocationInput = utils.getByTestId('milestone-location-input') as HTMLInputElement;

    await user.type(milestoneNameInput, 'Gathering');
    await user.type(milestoneStageInput, 'Stage C');
    await user.clear(milestoneDateInput);
    await user.type(milestoneDateInput, '2025-10-29');
    await user.type(milestoneTimeInput, '10:30');
    await user.type(milestoneLocationInput, 'HQ entrance');
    await act(async () => {
      await user.click(utils.getByRole('button', { name: 'マイルストーン追加' }));
    });

    await waitFor(() => expect(createMilestone).toHaveBeenCalledTimes(1));
    const [scheduleId, payload] = createMilestone.mock.calls[0];
    expect(scheduleId).toBe(1);
    expect(payload).toMatchObject({
      name: 'Gathering',
      stage: 'Stage C',
      location: 'HQ entrance',
      status: 'planned',
      note: null
    });
    expect(payload.start_time).toMatch(/T10:30:00/);
    expect(payload.end_time).toMatch(/T10:30:00/);
    expect(milestoneNameInput.value).toBe('');
  });
});
