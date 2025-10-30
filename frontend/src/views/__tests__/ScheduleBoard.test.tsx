import type { ContextType } from 'react';
import { render, screen } from '@testing-library/react';
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
    name: '大会1日目',
    event_date: '2024-08-10'
  }
];

const baseTasks: Task[] = [
  {
    id: 10,
    schedule_id: 1,
    name: '受付対応',
    stage: 'ステージA',
    start_time: '2024-08-10T08:00:00+09:00',
    end_time: '2024-08-10T08:45:00+09:00',
    location: 'メインロビー',
    status: 'planned',
    note: null
  },
  {
    id: 12,
    schedule_id: 1,
    name: 'スタート合図',
    stage: 'ステージB',
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
  syncState: 'idle' as const,
  lastSync: null,
  syncNow: vi.fn(),
  createMember: vi.fn(),
  updateMember: vi.fn(),
  deleteMember: vi.fn(),
  createMaterial: vi.fn(),
  updateMaterial: vi.fn(),
  deleteMaterial: vi.fn()
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
  it('ステージごとの予定をシンプルに表示する', () => {
    renderScheduleBoard();

    expect(screen.getByText('イベントスケジュール')).toBeInTheDocument();
    expect(screen.getByText('ステージA')).toBeInTheDocument();
    expect(screen.getByText('ステージB')).toBeInTheDocument();
    expect(screen.getByText('受付対応')).toBeInTheDocument();
    expect(screen.getByText('場所: メインロビー')).toBeInTheDocument();
    expect(screen.getByText('08:00 - 08:45')).toBeInTheDocument();
  });

  it('マイルストンイベントを時刻のみで表示する', () => {
    renderScheduleBoard();

    expect(screen.getByText('09:30 マイルストン')).toBeInTheDocument();
    expect(screen.getByText('スタート合図')).toBeInTheDocument();
  });

  it('スケジュールが存在しない場合の案内文を表示する', () => {
    renderScheduleBoard({ schedules: [], tasks: [] });

    expect(screen.getByText('まだスケジュールがありません。同期して予定を取り込みましょう。')).toBeInTheDocument();
  });
});
