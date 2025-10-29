import { FormEvent, useMemo, useState } from 'react';
import { useDataContext } from '../state/DataProvider';
import { MaterialInput, MaterialUpdateInput } from '../types';

const emptyMaterial: MaterialInput = {
  name: '',
  part: '',
  quantity: 1
};

export function MaterialsView(): JSX.Element {
  const { materials, createMaterial, updateMaterial, deleteMaterial } = useDataContext();
  const [newMaterial, setNewMaterial] = useState<MaterialInput>({ ...emptyMaterial });
  const [filter, setFilter] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState<MaterialUpdateInput | null>(null);

  const parts = useMemo(() => Array.from(new Set(materials.map((material) => material.part))).sort(), [materials]);

  const filteredMaterials = useMemo(() => {
    if (!filter) {
      return materials;
    }
    return materials.filter((material) => material.part === filter);
  }, [filter, materials]);

  const resetForm = () => {
    setNewMaterial({ ...emptyMaterial });
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newMaterial.name.trim() || !newMaterial.part.trim()) {
      return;
    }
    const parsedQuantity = Number(newMaterial.quantity);
    const quantity = Number.isFinite(parsedQuantity) ? Math.max(0, parsedQuantity) : 0;
    await createMaterial({
      ...newMaterial,
      name: newMaterial.name.trim(),
      part: newMaterial.part.trim(),
      quantity
    });
    resetForm();
  };

  const startEdit = (materialId: number) => {
    const target = materials.find((material) => material.id === materialId);
    if (!target) {
      return;
    }
    setEditingId(materialId);
    setEditingDraft({
      name: target.name,
      part: target.part,
      quantity: target.quantity
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
    const parsedQuantity =
      editingDraft.quantity !== undefined ? Number(editingDraft.quantity) : undefined;
    const quantity =
      parsedQuantity === undefined
        ? undefined
        : Number.isFinite(parsedQuantity)
          ? Math.max(0, parsedQuantity)
          : 0;
    await updateMaterial(editingId, {
      ...editingDraft,
      name: editingDraft.name?.trim() || undefined,
      part: editingDraft.part?.trim() || undefined,
      quantity
    });
    cancelEdit();
  };

  return (
    <div>
      <div className="form-panel">
        <h2>新規資材を追加</h2>
        <form className="form-grid" onSubmit={handleCreate}>
          <div className="input-group">
            <label htmlFor="material-name">資材名</label>
            <input
              id="material-name"
              value={newMaterial.name}
              onChange={(event) => setNewMaterial({ ...newMaterial, name: event.target.value })}
              placeholder="トランシーバー"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="material-part">担当パート</label>
            <input
              id="material-part"
              value={newMaterial.part}
              onChange={(event) => setNewMaterial({ ...newMaterial, part: event.target.value })}
              placeholder="本部"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="material-quantity">数量</label>
            <input
              id="material-quantity"
              type="number"
              min={0}
              value={newMaterial.quantity}
              onChange={(event) =>
                setNewMaterial({ ...newMaterial, quantity: Number(event.target.value) || 0 })
              }
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
        <h2>資材一覧</h2>
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="">全てのパート</option>
          {parts.map((part) => (
            <option key={part} value={part}>
              {part}
            </option>
          ))}
        </select>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="empty-state">対象の資材がありません</div>
      ) : (
        <div className="card-grid">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="card">
              {material.syncStatus === 'pending' ? <span className="pending-indicator">未同期</span> : null}
              {editingId === material.id && editingDraft ? (
                <form className="form-grid" onSubmit={submitEdit}>
                  <div className="input-group">
                    <label>資材名</label>
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
                    <label>数量</label>
                    <input
                      type="number"
                      min={0}
                      value={editingDraft.quantity ?? 0}
                      onChange={(event) =>
                        setEditingDraft({
                          ...editingDraft,
                          quantity: Number(event.target.value)
                        })
                      }
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
                  <h3>{material.name}</h3>
                  <div>
                    <span className="badge">{material.part}</span>
                  </div>
                  <div>数量: {material.quantity}</div>
                  <div className="card-actions">
                    <button type="button" className="button" onClick={() => startEdit(material.id)}>
                      編集
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => deleteMaterial(material.id)}
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
