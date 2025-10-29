import { FormEvent, useMemo, useState } from 'react';
import { useDataContext } from '../state/DataProvider';
import { MemberInput, MemberUpdateInput } from '../types';

const emptyMember: MemberInput = {
  name: '',
  part: '',
  position: '',
  contact: {
    phone: '',
    email: '',
    note: ''
  }
};

export function MembersView(): JSX.Element {
  const { members, createMember, updateMember, deleteMember } = useDataContext();
  const [newMember, setNewMember] = useState<MemberInput>({
    ...emptyMember,
    contact: { ...emptyMember.contact }
  });
  const [filter, setFilter] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState<MemberUpdateInput | null>(null);

  const parts = useMemo(() => Array.from(new Set(members.map((member) => member.part))).sort(), [members]);

  const filteredMembers = useMemo(() => {
    if (!filter) {
      return members;
    }
    return members.filter((member) => member.part === filter);
  }, [filter, members]);

  const resetForm = () => {
    setNewMember({ ...emptyMember, contact: { ...emptyMember.contact } });
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newMember.name.trim() || !newMember.part.trim()) {
      return;
    }
    await createMember({
      ...newMember,
      name: newMember.name.trim(),
      part: newMember.part.trim(),
      position: newMember.position.trim(),
      contact: {
        phone: newMember.contact.phone?.trim() || null,
        email: newMember.contact.email?.trim() || null,
        note: newMember.contact.note?.trim() || null
      }
    });
    resetForm();
  };

  const startEdit = (memberId: number) => {
    const target = members.find((member) => member.id === memberId);
    if (!target) {
      return;
    }
    setEditingId(memberId);
    setEditingDraft({
      name: target.name,
      part: target.part,
      position: target.position,
      contact: {
        phone: target.contact.phone ?? '',
        email: target.contact.email ?? '',
        note: target.contact.note ?? ''
      }
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingDraft(null);
  };

  const submitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId || !editingDraft) {
      return;
    }
    await updateMember(editingId, {
      name: editingDraft.name?.trim() || undefined,
      part: editingDraft.part?.trim() || undefined,
      position: editingDraft.position?.trim() || undefined,
      contact: {
        phone: editingDraft.contact?.phone?.trim() || null,
        email: editingDraft.contact?.email?.trim() || null,
        note: editingDraft.contact?.note?.trim() || null
      }
    });
    cancelEdit();
  };

  return (
    <div>
      <div className="form-panel">
        <h2>新規メンバーを追加</h2>
        <form className="form-grid" onSubmit={handleCreate}>
          <div className="input-group">
            <label htmlFor="member-name">氏名</label>
            <input
              id="member-name"
              value={newMember.name}
              onChange={(event) => setNewMember({ ...newMember, name: event.target.value })}
              placeholder="山田 太郎"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="member-part">担当パート</label>
            <input
              id="member-part"
              value={newMember.part}
              onChange={(event) => setNewMember({ ...newMember, part: event.target.value })}
              placeholder="ステージ"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="member-position">役割</label>
            <input
              id="member-position"
              value={newMember.position}
              onChange={(event) => setNewMember({ ...newMember, position: event.target.value })}
              placeholder="ステージ統括"
            />
          </div>
          <div className="input-group">
            <label htmlFor="member-phone">電話番号</label>
            <input
              id="member-phone"
              value={newMember.contact.phone}
              onChange={(event) =>
                setNewMember({
                  ...newMember,
                  contact: { ...newMember.contact, phone: event.target.value }
                })
              }
              placeholder="080-1234-5678"
            />
          </div>
          <div className="input-group">
            <label htmlFor="member-email">メール</label>
            <input
              id="member-email"
              value={newMember.contact.email}
              onChange={(event) =>
                setNewMember({
                  ...newMember,
                  contact: { ...newMember.contact, email: event.target.value }
                })
              }
              placeholder="taro@example.com"
            />
          </div>
          <div className="input-group">
            <label htmlFor="member-note">メモ</label>
            <textarea
              id="member-note"
              value={newMember.contact.note}
              onChange={(event) =>
                setNewMember({
                  ...newMember,
                  contact: { ...newMember.contact, note: event.target.value }
                })
              }
              rows={3}
            />
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <button type="submit" className="button">
              追加する
            </button>
          </div>
        </form>
      </div>

      <div className="section-heading">
        <h2>メンバー一覧</h2>
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="">全てのパート</option>
          {parts.map((part) => (
            <option key={part} value={part}>
              {part}
            </option>
          ))}
        </select>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="empty-state">対象のメンバーがいません</div>
      ) : (
        <div className="card-grid">
          {filteredMembers.map((member) => (
            <div key={member.id} className="card">
              {member.syncStatus === 'pending' ? <span className="pending-indicator">未同期</span> : null}
              {editingId === member.id && editingDraft ? (
                <form className="form-grid" onSubmit={submitEdit}>
                  <div className="input-group">
                    <label>氏名</label>
                    <input
                      value={editingDraft.name ?? ''}
                      onChange={(event) =>
                        setEditingDraft({ ...editingDraft, name: event.target.value || undefined })
                      }
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>担当パート</label>
                    <input
                      value={editingDraft.part ?? ''}
                      onChange={(event) =>
                        setEditingDraft({ ...editingDraft, part: event.target.value || undefined })
                      }
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>役割</label>
                    <input
                      value={editingDraft.position ?? ''}
                      onChange={(event) =>
                        setEditingDraft({ ...editingDraft, position: event.target.value || undefined })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>電話番号</label>
                    <input
                      value={editingDraft.contact?.phone ?? ''}
                      onChange={(event) =>
                        setEditingDraft({
                          ...editingDraft,
                          contact: {
                            ...editingDraft.contact,
                            phone: event.target.value
                          }
                        })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>メール</label>
                    <input
                      value={editingDraft.contact?.email ?? ''}
                      onChange={(event) =>
                        setEditingDraft({
                          ...editingDraft,
                          contact: {
                            ...editingDraft.contact,
                            email: event.target.value
                          }
                        })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>メモ</label>
                    <textarea
                      value={editingDraft.contact?.note ?? ''}
                      onChange={(event) =>
                        setEditingDraft({
                          ...editingDraft,
                          contact: {
                            ...editingDraft.contact,
                            note: event.target.value
                          }
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="card-actions">
                    <button type="submit" className="button">
                      保存
                    </button>
                    <button type="button" className="button secondary" onClick={cancelEdit}>
                      キャンセル
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3>{member.name}</h3>
                  <div>
                    <span className="badge">{member.part}</span>
                  </div>
                  <div>役割: {member.position || '未設定'}</div>
                  <div>
                    <strong>連絡先</strong>
                    <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>
                      <li>電話: {member.contact.phone ?? '未設定'}</li>
                      <li>メール: {member.contact.email ?? '未設定'}</li>
                      <li>メモ: {member.contact.note ?? 'なし'}</li>
                    </ul>
                  </div>
                  <div className="card-actions">
                    <button type="button" className="button" onClick={() => startEdit(member.id)}>
                      編集
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => deleteMember(member.id)}
                    >
                      削除
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
