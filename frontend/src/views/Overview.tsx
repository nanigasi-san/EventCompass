import { useMemo } from 'react';
import { useDataContext } from '../state/DataProvider';

export function Overview(): JSX.Element {
  const { members, materials, lastSync } = useDataContext();

  const pendingCounts = useMemo(() => {
    const pendingMembers = members.filter((member) => member.syncStatus === 'pending').length;
    const pendingMaterials = materials.filter((material) => material.syncStatus === 'pending').length;
    return {
      pendingMembers,
      pendingMaterials,
      total: pendingMembers + pendingMaterials
    };
  }, [members, materials]);

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;

  return (
    <div className="card-grid">
      <div className="card">
        <h3>メンバー数</h3>
        <p style={{ fontSize: '2.5rem', margin: '0' }}>{members.length}</p>
        <p style={{ color: '#64748b' }}>担当パート横断で登録されているメンバーの総数です。</p>
      </div>
      <div className="card">
        <h3>資材数</h3>
        <p style={{ fontSize: '2.5rem', margin: '0' }}>{materials.length}</p>
        <p style={{ color: '#64748b' }}>現在管理対象になっている資材の種類数です。</p>
      </div>
      <div className="card">
        <h3>未同期の変更</h3>
        <p style={{ fontSize: '2.5rem', margin: '0' }}>{pendingCounts.total}</p>
        <p style={{ color: '#64748b' }}>
          メンバー: {pendingCounts.pendingMembers} 件 / 資材: {pendingCounts.pendingMaterials} 件
        </p>
        <p style={{ color: '#334155', fontWeight: 600 }}>
          {isOnline ? 'オンラインです。同期ボタンで反映できます。' : 'オフラインです。オンライン復帰後に同期してください。'}
        </p>
        {lastSync ? (
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            最終同期: {new Date(lastSync).toLocaleString()}
          </p>
        ) : (
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>まだ同期は実行されていません</p>
        )}
      </div>
      <div className="card">
        <h3>スケジュール機能 (準備中)</h3>
        <p style={{ color: '#64748b' }}>
          バックエンド実装後にスケジュール管理ビューを追加できます。PWA なのでオフラインでも閲覧が可能です。
        </p>
      </div>
    </div>
  );
}
