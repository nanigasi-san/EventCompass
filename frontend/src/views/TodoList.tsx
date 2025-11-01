import { FormEvent, useMemo, useState } from 'react';
import { useDataContext } from '../state/DataProvider';
import type { TodoStatus } from '../types';

const statusLabels: Record<TodoStatus, string> = {
  pending: '未着手',
  in_progress: '進行中',
  completed: '完了'
};

export function TodoList(): JSX.Element {
  const { todos, members, createTodo, updateTodo, deleteTodo } = useDataContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [status, setStatus] = useState<TodoStatus>('pending');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const memberOptions = useMemo(
    () =>
      members
        .filter((member) => member.syncStatus === 'synced')
        .map((member) => ({ id: member.id, name: member.name })),
    [members]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('ToDo のタイトルを入力してください');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createTodo({
        title: trimmedTitle,
        description: description.trim() ? description.trim() : null,
        due_date: dueDate || null,
        status,
        assignee_id: assigneeId ? Number(assigneeId) : null
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssigneeId('');
      setStatus('pending');
    } catch (err) {
      console.error(err);
      setError('ToDo の追加に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (todoId: number, nextStatus: TodoStatus) => {
    try {
      await updateTodo(todoId, { status: nextStatus });
    } catch (err) {
      console.error(err);
      setError('ステータスの更新に失敗しました。');
    }
  };

  const handleAssigneeChange = async (todoId: number, nextAssignee: string) => {
    try {
      await updateTodo(todoId, {
        assignee_id: nextAssignee ? Number(nextAssignee) : null
      });
    } catch (err) {
      console.error(err);
      setError('担当者の更新に失敗しました。');
    }
  };

  const handleDelete = async (todoId: number) => {
    if (!window.confirm('この ToDo を削除しますか？')) {
      return;
    }
    try {
      await deleteTodo(todoId);
    } catch (err) {
      console.error(err);
      setError('削除に失敗しました。');
    }
  };

  const displayMemberName = (id: number | null) => {
    if (id === null) {
      return '未割り当て';
    }
    const member = members.find((record) => record.id === id);
    return member ? member.name : '不明なメンバー';
  };

  return (
    <section className="list-panel" id="todos">
      <div className="section-header">
        <div className="section-title">
          <h2>ToDo リスト</h2>
          <p>日々の作業と担当者をフォローしましょう。</p>
        </div>
      </div>

      <form className="todo-form" onSubmit={handleSubmit}>
        <div className="todo-form__fields">
          <label className="todo-form__field">
            <span>タイトル</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="例: 会場レイアウト最終確認"
              required
            />
          </label>
          <label className="todo-form__field">
            <span>説明</span>
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="任意"
            />
          </label>
          <label className="todo-form__field">
            <span>期限</span>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>
          <label className="todo-form__field">
            <span>担当</span>
            <select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
              <option value="">未割り当て</option>
              {memberOptions.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="todo-form__field">
            <span>状態</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as TodoStatus)}>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="todo-form__actions">
          <button type="submit" className="button button-glow" disabled={submitting}>
            ToDo を追加
          </button>
        </div>
        {error && (
          <p className="todo-form__error" role="alert">
            {error}
          </p>
        )}
      </form>

      {todos.length === 0 ? (
        <div className="todo-empty">
          <p>登録されている ToDo はありません。最初のタスクを追加しましょう。</p>
        </div>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className="todo-list__item">
              <div className="todo-list__body">
                <h3>{todo.title}</h3>
                {todo.description && <p className="todo-list__description">{todo.description}</p>}
                <div className="todo-list__meta">
                  <span>期限: {todo.due_date ? new Date(todo.due_date).toLocaleDateString() : '未設定'}</span>
                  <span>担当: {displayMemberName(todo.assignee_id)}</span>
                </div>
              </div>
              <div className="todo-list__controls">
                <label>
                  <span className="visually-hidden">状態</span>
                  <select
                    value={todo.status}
                    onChange={(event) => handleStatusChange(todo.id, event.target.value as TodoStatus)}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="visually-hidden">担当</span>
                  <select
                    value={todo.assignee_id ?? ''}
                    onChange={(event) => handleAssigneeChange(todo.id, event.target.value)}
                  >
                    <option value="">未割り当て</option>
                    {memberOptions.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="button button-danger"
                  onClick={() => handleDelete(todo.id)}
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

