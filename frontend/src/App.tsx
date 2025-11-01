import { useState } from 'react';
import { useDataContext } from './state/DataProvider';
import { ScheduleBoard } from './views/ScheduleBoard';
import { Overview } from './views/Overview';

function App(): JSX.Element {
  const { syncState, syncNow, lastSync, resetAll } = useDataContext();
  const [resetting, setResetting] = useState(false);

  const syncBadge = [
    'sync-indicator',
    syncState === 'error' ? 'is-error' : syncState === 'syncing' ? 'is-syncing' : 'is-idle'
  ]
    .filter(Boolean)
    .join(' ');

  const syncText =
    syncState === 'syncing'
      ? '同期中'
      : syncState === 'error'
        ? '同期に失敗しました'
        : '最新の状態です';

  const handleReset = async () => {
    if (resetting) {
      return;
    }
    if (!window.confirm('現在のすべてのデータを完全に削除します。よろしいですか？')) {
      return;
    }
    setResetting(true);
    try {
      await resetAll();
    } catch (error) {
      console.error(error);
      window.alert('データのリセットに失敗しました。時間をおいて再度お試しください。');
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="content">
      <ScheduleBoard />
      <header className="command-bar">
        <div className="command-primary">
          <h2>同期情報</h2>
          <p>メンバーと資材データの同期状況を確認し、必要に応じて更新します。</p>
        </div>
        <div className="command-status">
          <div className={syncBadge}>{syncText}</div>
          <div className="command-timestamp">
            最終同期:{' '}
            {lastSync ? new Date(lastSync).toLocaleString() : 'まだ同期が実行されていません'}
          </div>
          <div className="command-actions">
            <button
              className="button button-glow"
              onClick={syncNow}
              disabled={syncState === 'syncing' || resetting}
            >
              すぐに同期
            </button>
            <button
              className="button button-danger"
              onClick={handleReset}
              disabled={syncState === 'syncing' || resetting}
            >
              全データをリセット
            </button>
          </div>
        </div>
      </header>
      <Overview />
    </main>
  );
}

export default App;
