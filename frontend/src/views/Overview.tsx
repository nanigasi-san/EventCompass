import { FormEvent, useMemo, useState } from 'react';
import { useDataContext } from '../state/DataProvider';
import {
  MaterialInput,
  MaterialUpdateInput,
  MemberInput,
  MemberUpdateInput
} from '../types';

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

const emptyMaterial: MaterialInput = {
  name: '',
  part: '',
  quantity: 1
};

export function Overview(): JSX.Element {
  const {
    members,
    materials,
    lastSync,
    createMember,
    updateMember,
    deleteMember,
    createMaterial,
    updateMaterial,
    deleteMaterial
  } = useDataContext();

  const pendingCounts = useMemo(() => {
    const pendingMembers = members.filter((member) => member.syncStatus === 'pending').length;
    const pendingMaterials = materials.filter((material) => material.syncStatus === 'pending').length;
    return {
      pendingMembers,
      pendingMaterials,
      total: pendingMembers + pendingMaterials
    };
  }, [members, materials]);

  const memberParts = useMemo(
    () =>
      Array.from(
        new Set(
          members
            .map((member) => member.part.trim())
            .filter((part) => part.length > 0)
        )
      ).sort((a, b) => a.localeCompare(b, 'ja')),
    [members]
  );

  const materialParts = useMemo(
    () =>
      Array.from(
        new Set(
          materials
            .map((material) => material.part.trim())
            .filter((part) => part.length > 0)
        )
      ).sort((a, b) => a.localeCompare(b, 'ja')),
    [materials]
  );

  const [memberFilter, setMemberFilter] = useState<string>('');
  const [materialFilter, setMaterialFilter] = useState<string>('');
  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [materialFormOpen, setMaterialFormOpen] = useState(false);
  const [memberDraft, setMemberDraft] = useState<MemberInput>({
    ...emptyMember,
    contact: { ...emptyMember.contact }
  });
  const [materialDraft, setMaterialDraft] = useState<MaterialInput>({ ...emptyMaterial });
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editingMemberDraft, setEditingMemberDraft] = useState<MemberUpdateInput | null>(null);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [editingMaterialDraft, setEditingMaterialDraft] = useState<MaterialUpdateInput | null>(null);

  const filteredMembers = useMemo(() => {
    if (!memberFilter) {
      return members;
    }
    return members.filter((member) => member.part === memberFilter);
  }, [memberFilter, members]);

  const filteredMaterials = useMemo(() => {
    if (!materialFilter) {
      return materials;
    }
    return materials.filter((material) => material.part === materialFilter);
  }, [materialFilter, materials]);

  const resetMemberDraft = () => {
    setMemberDraft({ ...emptyMember, contact: { ...emptyMember.contact } });
  };

  const resetMaterialDraft = () => {
    setMaterialDraft({ ...emptyMaterial });
  };

  const handleCreateMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!memberDraft.name.trim() || !memberDraft.part.trim()) {
      return;
    }
    await createMember({
      ...memberDraft,
      name: memberDraft.name.trim(),
      part: memberDraft.part.trim(),
      position: memberDraft.position.trim(),
      contact: {
        phone: memberDraft.contact.phone?.trim() || null,
        email: memberDraft.contact.email?.trim() || null,
        note: memberDraft.contact.note?.trim() || null
      }
    });
    resetMemberDraft();
    setMemberFormOpen(false);
  };

  const handleCreateMaterial = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!materialDraft.name.trim() || !materialDraft.part.trim()) {
      return;
    }
    const parsedQuantity = Number(materialDraft.quantity);
    const quantity = Number.isFinite(parsedQuantity) ? Math.max(0, parsedQuantity) : 0;

    await createMaterial({
      ...materialDraft,
      name: materialDraft.name.trim(),
      part: materialDraft.part.trim(),
      quantity
    });
    resetMaterialDraft();
    setMaterialFormOpen(false);
  };

  const startMemberEdit = (memberId: number) => {
    const target = members.find((member) => member.id === memberId);
    if (!target) {
      return;
    }
    setEditingMemberId(memberId);
    setEditingMemberDraft({
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

  const cancelMemberEdit = () => {
    setEditingMemberId(null);
    setEditingMemberDraft(null);
  };

  const submitMemberEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingMemberId || !editingMemberDraft) {
      return;
    }
    await updateMember(editingMemberId, {
      name: editingMemberDraft.name?.trim() || undefined,
      part: editingMemberDraft.part?.trim() || undefined,
      position: editingMemberDraft.position?.trim() || undefined,
      contact: {
        phone: editingMemberDraft.contact?.phone?.trim() || null,
        email: editingMemberDraft.contact?.email?.trim() || null,
        note: editingMemberDraft.contact?.note?.trim() || null
      }
    });
    cancelMemberEdit();
  };

  const handleDeleteMember = async (memberId: number) => {
    if (editingMemberId === memberId) {
      cancelMemberEdit();
    }
    await deleteMember(memberId);
  };

  const startMaterialEdit = (materialId: number) => {
    const target = materials.find((material) => material.id === materialId);
    if (!target) {
      return;
    }
    setEditingMaterialId(materialId);
    setEditingMaterialDraft({
      name: target.name,
      part: target.part,
      quantity: target.quantity
    });
  };

  const cancelMaterialEdit = () => {
    setEditingMaterialId(null);
    setEditingMaterialDraft(null);
  };

  const submitMaterialEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingMaterialId || editingMaterialDraft === null) {
      return;
    }
    const parsedQuantity =
      editingMaterialDraft.quantity !== undefined ? Number(editingMaterialDraft.quantity) : undefined;
    const normalizedQuantity =
      parsedQuantity === undefined
        ? undefined
        : Number.isFinite(parsedQuantity)
          ? Math.max(0, parsedQuantity)
          : 0;
    await updateMaterial(editingMaterialId, {
      name: editingMaterialDraft.name?.trim() || undefined,
      part: editingMaterialDraft.part?.trim() || undefined,
      quantity: normalizedQuantity
    });
    cancelMaterialEdit();
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (editingMaterialId === materialId) {
      cancelMaterialEdit();
    }
    await deleteMaterial(materialId);
  };

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;
  const formattedLastSync = lastSync ? new Date(lastSync).toLocaleString() : null;

  return (
    <div className="overview-shell" id="overview">
      <div className="glance-grid">
        <div className="glance-card">
          <span className="glance-card-label">メンバー総数</span>
          <span className="glance-card-value">{members.length}</span>
          <span className="glance-card-meta">登録済みのメンバーが一覧で確認できます。</span>
        </div>
        <div className="glance-card">
          <span className="glance-card-label">資材総数</span>
          <span className="glance-card-value">{materials.length}</span>
          <span className="glance-card-meta">最新の資材在庫をすぐに把握できます。</span>
        </div>
        <div className="glance-card">
          <span className="glance-card-label">未同期アイテム</span>
          <span className="glance-card-value">{pendingCounts.total}</span>
          <span className="glance-card-meta">
            メンバー {pendingCounts.pendingMembers} 件 / 資材 {pendingCounts.pendingMaterials} 件
          </span>
        </div>
        <div className={`glance-card ${isOnline ? 'online' : 'offline'}`}>
          <span className="glance-card-label">接続ステータス</span>
          <span className="glance-card-value">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          <span className="glance-card-meta">
            {formattedLastSync ? `最終同期: ${formattedLastSync}` : 'まだ同期は完了していません。'}
          </span>
        </div>
      </div>

      <div className="data-columns">
        <section className="data-panel" id="members">
          <div className="panel-header">
            <div>
              <h2>メンバーハブ</h2>
              <p className="panel-subtitle">担当別に整列されたメンバー情報を集中管理します。</p>
            </div>
            <div className="panel-controls">
              <label className="panel-filter">
                <span>担当フィルタ</span>
                <select value={memberFilter} onChange={(event) => setMemberFilter(event.target.value)}>
                  <option value="">すべて</option>
                  {memberParts.map((part) => (
                    <option key={part} value={part}>
                      {part}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="button ghost"
                onClick={() => setMemberFormOpen((prev) => !prev)}
              >
                {memberFormOpen ? '閉じる' : 'メンバーを追加'}
              </button>
            </div>
          </div>

          {memberFormOpen ? (
            <form className="quick-form" onSubmit={handleCreateMember}>
              <div className="quick-form-grid">
                <div className="input-group">
                  <label htmlFor="overview-member-name">名前</label>
                  <input
                    id="overview-member-name"
                    value={memberDraft.name}
                    onChange={(event) => setMemberDraft({ ...memberDraft, name: event.target.value })}
                    placeholder="例: 佐藤 蓮"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="overview-member-part">担当</label>
                  <input
                    id="overview-member-part"
                    value={memberDraft.part}
                    onChange={(event) => setMemberDraft({ ...memberDraft, part: event.target.value })}
                    placeholder="例: ステージ"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="overview-member-position">役職</label>
                  <input
                    id="overview-member-position"
                    value={memberDraft.position}
                    onChange={(event) => setMemberDraft({ ...memberDraft, position: event.target.value })}
                    placeholder="例: リーダー"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="overview-member-phone">電話番号</label>
                  <input
                    id="overview-member-phone"
                    value={memberDraft.contact.phone ?? ''}
                    onChange={(event) =>
                      setMemberDraft({
                        ...memberDraft,
                        contact: { ...memberDraft.contact, phone: event.target.value }
                      })
                    }
                    placeholder="例: 090-1234-5678"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="overview-member-email">メール</label>
                  <input
                    id="overview-member-email"
                    type="email"
                    value={memberDraft.contact.email ?? ''}
                    onChange={(event) =>
                      setMemberDraft({
                        ...memberDraft,
                        contact: { ...memberDraft.contact, email: event.target.value }
                      })
                    }
                    placeholder="例: ren.sato@example.com"
                  />
                </div>
                <div className="input-group input-group--span">
                  <label htmlFor="overview-member-note">メモ</label>
                  <textarea
                    id="overview-member-note"
                    rows={2}
                    value={memberDraft.contact.note ?? ''}
                    onChange={(event) =>
                      setMemberDraft({
                        ...memberDraft,
                        contact: { ...memberDraft.contact, note: event.target.value }
                      })
                    }
                    placeholder="共有しておきたい情報を入力"
                  />
                </div>
              </div>
              <div className="panel-actions">
                <button type="submit" className="button">
                  登録する
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    resetMemberDraft();
                    setMemberFormOpen(false);
                  }}
                >
                  キャンセル
                </button>
              </div>
            </form>
          ) : null}

          {filteredMembers.length === 0 ? (
            <div className="panel-empty">条件に一致するメンバーが見つかりません。</div>
          ) : (
            <ul className="entity-list">
              {filteredMembers.map((member) => {
                const isEditing = editingMemberId === member.id && editingMemberDraft;
                return (
                  <li
                    key={member.id}
                    className={`entity-row ${isEditing ? 'entity-row--edit' : ''}`}
                  >
                    {isEditing && editingMemberDraft ? (
                      <form className="quick-edit-grid" onSubmit={submitMemberEdit}>
                        <div className="input-group">
                          <label>名前</label>
                          <input
                            value={editingMemberDraft.name ?? ''}
                            onChange={(event) =>
                              setEditingMemberDraft({
                                ...editingMemberDraft,
                                name: event.target.value || undefined
                              })
                            }
                            required
                          />
                        </div>
                        <div className="input-group">
                          <label>担当</label>
                          <input
                            value={editingMemberDraft.part ?? ''}
                            onChange={(event) =>
                              setEditingMemberDraft({
                                ...editingMemberDraft,
                                part: event.target.value || undefined
                              })
                            }
                            required
                          />
                        </div>
                        <div className="input-group">
                          <label>役職</label>
                          <input
                            value={editingMemberDraft.position ?? ''}
                            onChange={(event) =>
                              setEditingMemberDraft({
                                ...editingMemberDraft,
                                position: event.target.value || undefined
                              })
                            }
                          />
                        </div>
                        <div className="input-group">
                          <label>電話番号</label>
                          <input
                            value={editingMemberDraft.contact?.phone ?? ''}
                            onChange={(event) =>
                              setEditingMemberDraft({
                                ...editingMemberDraft,
                                contact: {
                                  ...editingMemberDraft.contact,
                                  phone: event.target.value
                                }
                              })
                            }
                          />
                        </div>
                        <div className="input-group">
                          <label>メール</label>
                          <input
                            type="email"
                            value={editingMemberDraft.contact?.email ?? ''}
                            onChange={(event) =>
                              setEditingMemberDraft({
                                ...editingMemberDraft,
                                contact: {
                                  ...editingMemberDraft.contact,
                                  email: event.target.value
                                }
                              })
                            }
                          />
                        </div>
                        <div className="input-group input-group--span">
                          <label>メモ</label>
                          <textarea
                            rows={2}
                            value={editingMemberDraft.contact?.note ?? ''}
                            onChange={(event) =>
                              setEditingMemberDraft({
                                ...editingMemberDraft,
                                contact: {
                                  ...editingMemberDraft.contact,
                                  note: event.target.value
                                }
                              })
                            }
                          />
                        </div>
                        <div className="form-action-row">
                          <button type="submit" className="button">
                            保存
                          </button>
                          <button
                            type="button"
                            className="button secondary"
                            onClick={cancelMemberEdit}
                          >
                            キャンセル
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="entity-view">
                        <div className="entity-title-row">
                          <div className="entity-title">{member.name}</div>
                          <span
                            className={`status-badge ${
                              member.syncStatus === 'pending' ? 'pending' : 'synced'
                            }`}
                          >
                            {member.syncStatus === 'pending' ? '同期待ち' : '同期済み'}
                          </span>
                        </div>
                        <div className="entity-meta">
                          <span className="entity-chip">{member.part}</span>
                          <span className="entity-meta-text">
                            {member.position ? ` / ${member.position}` : ' / 役職未設定'}
                          </span>
                        </div>
                        <div className="entity-footnote">
                          メール: {member.contact.email ?? '未設定'} ・ 電話:{' '}
                          {member.contact.phone ?? '未設定'}
                        </div>
                        <div className="entity-actions">
                          <button
                            type="button"
                            className="button ghost"
                            onClick={() => startMemberEdit(member.id)}
                          >
                            編集
                          </button>
                          <button
                            type="button"
                            className="button secondary"
                            onClick={() => void handleDeleteMember(member.id)}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="data-panel" id="materials">
          <div className="panel-header">
            <div>
              <h2>資材レジストリ</h2>
              <p className="panel-subtitle">在庫状況をタイムラインで監視し、即時に調整します。</p>
            </div>
            <div className="panel-controls">
              <label className="panel-filter">
                <span>担当フィルタ</span>
                <select value={materialFilter} onChange={(event) => setMaterialFilter(event.target.value)}>
                  <option value="">すべて</option>
                  {materialParts.map((part) => (
                    <option key={part} value={part}>
                      {part}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="button ghost"
                onClick={() => setMaterialFormOpen((prev) => !prev)}
              >
                {materialFormOpen ? '閉じる' : '資材を追加'}
              </button>
            </div>
          </div>

          {materialFormOpen ? (
            <form className="quick-form" onSubmit={handleCreateMaterial}>
              <div className="quick-form-grid">
                <div className="input-group">
                  <label htmlFor="overview-material-name">資材名</label>
                  <input
                    id="overview-material-name"
                    value={materialDraft.name}
                    onChange={(event) =>
                      setMaterialDraft({ ...materialDraft, name: event.target.value })
                    }
                    placeholder="例: スポットライト"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="overview-material-part">担当</label>
                  <input
                    id="overview-material-part"
                    value={materialDraft.part}
                    onChange={(event) =>
                      setMaterialDraft({ ...materialDraft, part: event.target.value })
                    }
                    placeholder="例: 照明"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="overview-material-quantity">数量</label>
                  <input
                    id="overview-material-quantity"
                    type="number"
                    min={0}
                    value={materialDraft.quantity}
                    onChange={(event) =>
                      setMaterialDraft({
                        ...materialDraft,
                        quantity: Number(event.target.value) || 0
                      })
                    }
                  />
                </div>
              </div>
              <div className="panel-actions">
                <button type="submit" className="button">
                  登録する
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    resetMaterialDraft();
                    setMaterialFormOpen(false);
                  }}
                >
                  キャンセル
                </button>
              </div>
            </form>
          ) : null}

          {filteredMaterials.length === 0 ? (
            <div className="panel-empty">条件に一致する資材が見つかりません。</div>
          ) : (
            <ul className="entity-list">
              {filteredMaterials.map((material) => {
                const isEditing = editingMaterialId === material.id && editingMaterialDraft !== null;
                return (
                  <li
                    key={material.id}
                    className={`entity-row ${isEditing ? 'entity-row--edit' : ''}`}
                  >
                    {isEditing && editingMaterialDraft !== null ? (
                      <form className="quick-edit-grid" onSubmit={submitMaterialEdit}>
                        <div className="input-group">
                          <label>資材名</label>
                          <input
                            value={editingMaterialDraft.name ?? ''}
                            onChange={(event) =>
                              setEditingMaterialDraft({
                                ...editingMaterialDraft,
                                name: event.target.value || undefined
                              })
                            }
                            required
                          />
                        </div>
                        <div className="input-group">
                          <label>担当</label>
                          <input
                            value={editingMaterialDraft.part ?? ''}
                            onChange={(event) =>
                              setEditingMaterialDraft({
                                ...editingMaterialDraft,
                                part: event.target.value || undefined
                              })
                            }
                            required
                          />
                        </div>
                        <div className="input-group">
                          <label>数量</label>
                          <input
                            type="number"
                            min={0}
                            value={editingMaterialDraft.quantity ?? 0}
                            onChange={(event) =>
                              setEditingMaterialDraft({
                                ...editingMaterialDraft,
                                quantity: Number(event.target.value)
                              })
                            }
                          />
                        </div>
                        <div className="form-action-row">
                          <button type="submit" className="button">
                            保存
                          </button>
                          <button
                            type="button"
                            className="button secondary"
                            onClick={cancelMaterialEdit}
                          >
                            キャンセル
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="entity-view">
                        <div className="entity-title-row">
                          <div className="entity-title">{material.name}</div>
                          <span
                            className={`status-badge ${
                              material.syncStatus === 'pending' ? 'pending' : 'synced'
                            }`}
                          >
                            {material.syncStatus === 'pending' ? '同期待ち' : '同期済み'}
                          </span>
                        </div>
                        <div className="entity-meta">
                          <span className="entity-chip">{material.part}</span>
                          <span className="entity-meta-text"> / 数量: {material.quantity}</span>
                        </div>
                        <div className="entity-actions entity-actions--compact">
                          <button
                            type="button"
                            className="button ghost"
                            onClick={() => startMaterialEdit(material.id)}
                          >
                            編集
                          </button>
                          <button
                            type="button"
                            className="button secondary"
                            onClick={() => void handleDeleteMaterial(material.id)}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
