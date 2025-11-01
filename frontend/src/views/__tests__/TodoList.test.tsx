import type { ContextType } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TodoList } from '../TodoList';
import { DataContext } from '../../state/DataProvider';
import type { MemberRecord, Todo } from '../../types';

type ContextOverrides = Partial<ContextType<typeof DataContext>>;

const baseMembers: MemberRecord[] = [
  {
    id: 1,
    name: 'Haruka Sato',
    part: 'Reception',
    position: 'Lead',
    contact: { email: 'haruka@example.com', phone: '090-0000-0001', note: null },
    syncStatus: 'synced'
  }
];

const baseTodos: Todo[] = [
  {
    id: 42,
    title: 'バナー掲示位置の確認',
    description: 'メインホール入り口の左右に設営',
    due_date: '2025-01-05',
    status: 'pending',
    assignee_id: 1
  }
];

const defaultContext = {
  members: baseMembers,
  materials: [],
  schedules: [],
  tasks: [],
  todos: baseTodos,
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
  createSchedule: vi.fn(),
  createMilestone: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn()
};

function renderTodoList(overrides: ContextOverrides = {}) {
  const value = { ...defaultContext, ...overrides } as ContextType<typeof DataContext>;
  return render(
    <DataContext.Provider value={value}>
      <TodoList />
    </DataContext.Provider>
  );
}

describe('TodoList', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('shows empty state when no todos exist', () => {
    renderTodoList({ todos: [] });

    expect(screen.getByText(/ToDo はありません/)).toBeInTheDocument();
  });

  it('submits the create form with trimmed values', async () => {
    const createTodo = vi.fn();
    const user = userEvent.setup();
    renderTodoList({ todos: [], createTodo });

    const form = screen.getByText(/ToDo を追加/).closest('form');
    if (!form) {
      throw new Error('form not found');
    }
    const utils = within(form);

    await user.type(utils.getByLabelText('タイトル'), ' 新規タスク ');
    await user.type(utils.getByLabelText('説明'), ' 詳細メモ ');
    await user.type(utils.getByLabelText('期限'), '2025-02-10');
    await user.selectOptions(utils.getByLabelText('担当'), '1');
    await user.selectOptions(utils.getByLabelText('状態'), 'in_progress');
    await user.click(utils.getByRole('button', { name: /ToDo を追加/ }));

    await waitFor(() =>
      expect(createTodo).toHaveBeenCalledWith({
        title: '新規タスク',
        description: '詳細メモ',
        due_date: '2025-02-10',
        status: 'in_progress',
        assignee_id: 1
      })
    );
  });

  it('updates status via the list control', async () => {
    const updateTodo = vi.fn();
    const user = userEvent.setup();
    renderTodoList({ updateTodo });

    const item = screen.getByText(/バナー掲示位置の確認/).closest('li');
    if (!item) {
      throw new Error('todo item not found');
    }
    const select = within(item).getAllByRole('combobox')[0] as HTMLSelectElement;

    await user.selectOptions(select, 'completed');

    await waitFor(() =>
      expect(updateTodo).toHaveBeenCalledWith(42, { status: 'completed' })
    );
  });

  it('deletes a todo after confirmation', async () => {
    const deleteTodo = vi.fn();
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderTodoList({ deleteTodo });

    const deleteButton = screen.getByRole('button', { name: '削除' });
    await user.click(deleteButton);

    await waitFor(() => expect(deleteTodo).toHaveBeenCalledWith(42));
  });
});

