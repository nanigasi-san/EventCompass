import { FormEvent, useMemo, useState } from 'react';
import { useDataContext } from '../state/DataProvider';
import { MaterialInput, MemberInput } from '../types';
import { TodoList } from './TodoList';

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
  const { members, materials, lastSync, createMember, createMaterial } = useDataContext();

  const pending = useMemo(() => {
    const pendingMembers = members.filter((member) => member.syncStatus === 'pending').length;
    const pendingMaterials = materials.filter((material) => material.syncStatus === 'pending').length;
    return {
      members: pendingMembers,
      materials: pendingMaterials
    };
  }, [members, materials]);

  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [materialFormOpen, setMaterialFormOpen] = useState(false);

  const [memberDraft, setMemberDraft] = useState<MemberInput>({
    ...emptyMember,
    contact: { ...emptyMember.contact }
  });
  const [materialDraft, setMaterialDraft] = useState<MaterialInput>({ ...emptyMaterial });

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;
  const statusLabel = isOnline ? 'オンライン接続中' : 'オフラインモード';
  const syncLabel = lastSync ? new Date(lastSync).toLocaleString() : '同期履歴はまだありません';

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

  return (
    <div className="dashboard">
      <section className="metrics-grid metrics-grid--simple">
        <article className="metric-card">
          <header>
            <span className="metric-label">乗員</span>
            <span className="metric-icon" />
          </header>
          <p className="metric-value">{members.length}</p>
          <p className="metric-footnote">登録済みのスタッフ数です。</p>
        </article>
        <article className="metric-card">
          <header>
            <span className="metric-label">物資</span>
            <span className="metric-icon" />
          </header>
          <p className="metric-value">{materials.length}</p>
          <p className="metric-footnote">現在管理している資材の種類数です。</p>
        </article>
      </section>

      <section className="status-strip">
        <div className={`status-pill ${isOnline ? 'is-online' : 'is-offline'}`}>{statusLabel}</div>
        <time className="status-time">{syncLabel}</time>
        <div className="status-note">
          同期待ち: 乗員 {pending.members} 件 / 資材 {pending.materials} 件
        </div>
      </section>

      <div className="data-split">
        <section className="list-panel" id="members">
          <div className="section-header">
            <div className="section-title">
              <h2>乗員リスト</h2>
              <p>担当と連絡先をすぐに確認できます。</p>
            </div>
            <div className="section-actions">
              <button
                type="button"
                className="button button-ghost"
                onClick={() => setMemberFormOpen((prev) => !prev)}
              >
                {memberFormOpen ? '入力フォームを閉じる' : '乗員を追加'}
              </button>
            </div>
          </div>

          {memberFormOpen ? (
            <form className="add-form" onSubmit={handleCreateMember}>
              <div className="form-grid">
                <label className="form-group">
                  <span>氏名</span>
                  <input
                    className="form-field"
                    value={memberDraft.name}
                    onChange={(event) => setMemberDraft({ ...memberDraft, name: event.target.value })}
                    placeholder="佐藤 蓮"
                    required
                  />
                </label>
                <label className="form-group">
                  <span>担当</span>
                  <input
                    className="form-field"
                    value={memberDraft.part}
                    onChange={(event) => setMemberDraft({ ...memberDraft, part: event.target.value })}
                    placeholder="ステージ"
                    required
                  />
                </label>
                <label className="form-group">
                  <span>役職</span>
                  <input
                    className="form-field"
                    value={memberDraft.position}
                    onChange={(event) => setMemberDraft({ ...memberDraft, position: event.target.value })}
                    placeholder="リーダー"
                  />
                </label>
                <label className="form-group">
                  <span>電話番号</span>
                  <input
                    className="form-field"
                    value={memberDraft.contact.phone ?? ''}
                    onChange={(event) =>
                      setMemberDraft({
                        ...memberDraft,
                        contact: { ...memberDraft.contact, phone: event.target.value }
                      })
                    }
                    placeholder="090-1234-5678"
                  />
                </label>
                <label className="form-group">
                  <span>メールアドレス</span>
                  <input
                    className="form-field"
                    type="email"
                    value={memberDraft.contact.email ?? ''}
                    onChange={(event) =>
                      setMemberDraft({
                        ...memberDraft,
                        contact: { ...memberDraft.contact, email: event.target.value }
                      })
                    }
                    placeholder="example@example.com"
                  />
                </label>
                <label className="form-group">
                  <span>メモ</span>
                  <input
                    className="form-field"
                    value={memberDraft.contact.note ?? ''}
                    onChange={(event) =>
                      setMemberDraft({
                        ...memberDraft,
                        contact: { ...memberDraft.contact, note: event.target.value }
                      })
                    }
                    placeholder="共有したい情報を入力してください"
                  />
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="button button-secondary" onClick={resetMemberDraft}>
                  リセット
                </button>
                <button type="submit" className="button button-primary">
                  乗員を保存
                </button>
              </div>
            </form>
          ) : null}

          {members.length === 0 ? (
            <div className="list-empty">乗員はまだ登録されていません。</div>
          ) : (
            <div className="list-scroll">
              {members.map((member) => (
                <article key={member.id} className="list-item">
                  <div className="item-header">
                    <div className="item-title">{member.name}</div>
                    <span
                      className={`status-chip ${member.syncStatus === 'pending' ? 'is-pending' : ''}`}
                    >
                      {member.syncStatus === 'pending' ? '同期待ち' : '同期済み'}
                    </span>
                  </div>
                  <div className="item-meta">
                    <span className="item-chip">{member.part}</span>
                    <span>{member.position || '役職未設定'}</span>
                  </div>
                  <div className="item-footnote">
                    メール: {member.contact.email ?? '未登録'} ・ 電話: {member.contact.phone ?? '未登録'}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="list-panel" id="materials">
          <div className="section-header">
            <div className="section-title">
              <h2>物資リスト</h2>
              <p>現場で使用する資材の状況を確認できます。</p>
            </div>
            <div className="section-actions">
              <button
                type="button"
                className="button button-ghost"
                onClick={() => setMaterialFormOpen((prev) => !prev)}
              >
                {materialFormOpen ? '入力フォームを閉じる' : '資材を追加'}
              </button>
            </div>
          </div>

          {materialFormOpen ? (
            <form className="add-form" onSubmit={handleCreateMaterial}>
              <div className="form-grid">
                <label className="form-group">
                  <span>資材名</span>
                  <input
                    className="form-field"
                    value={materialDraft.name}
                    onChange={(event) => setMaterialDraft({ ...materialDraft, name: event.target.value })}
                    placeholder="スポットライト"
                    required
                  />
                </label>
                <label className="form-group">
                  <span>担当</span>
                  <input
                    className="form-field"
                    value={materialDraft.part}
                    onChange={(event) => setMaterialDraft({ ...materialDraft, part: event.target.value })}
                    placeholder="照明"
                    required
                  />
                </label>
                <label className="form-group">
                  <span>数量</span>
                  <input
                    className="form-field"
                    type="number"
                    min={0}
                    value={materialDraft.quantity}
                    onChange={(event) =>
                      setMaterialDraft({ ...materialDraft, quantity: Number(event.target.value) || 0 })
                    }
                  />
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="button button-secondary" onClick={resetMaterialDraft}>
                  リセット
                </button>
                <button type="submit" className="button button-primary">
                  資材を保存
                </button>
              </div>
            </form>
          ) : null}

          {materials.length === 0 ? (
            <div className="list-empty">資材はまだ登録されていません。</div>
          ) : (
            <div className="list-scroll">
              {materials.map((material) => (
                <article key={material.id} className="list-item">
                  <div className="item-header">
                    <div className="item-title">{material.name}</div>
                    <span
                      className={`status-chip ${material.syncStatus === 'pending' ? 'is-pending' : ''}`}
                    >
                      {material.syncStatus === 'pending' ? '同期待ち' : '同期済み'}
                    </span>
                  </div>
                  <div className="item-meta">
                    <span className="item-chip">{material.part}</span>
                    <span className="item-quantity">数量: {material.quantity}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <TodoList />
      </div>
    </div>
  );
}
