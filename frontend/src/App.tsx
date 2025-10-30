import { useDataContext } from './state/DataProvider';
import { ScheduleBoard } from './views/ScheduleBoard';
import { Overview } from './views/Overview';

function App(): JSX.Element {
  const { syncState, syncNow, lastSync } = useDataContext();

  const syncBadge = [
    'sync-indicator',
    syncState === 'error' ? 'is-error' : syncState === 'syncing' ? 'is-syncing' : 'is-idle'
  ]
    .filter(Boolean)
    .join(' ');

  const syncText =
    syncState === 'syncing'
      ? '同期中…'
      : syncState === 'error'
        ? '同期に失敗しました'
        : '最新の状態です';

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
            {lastSync ? new Date(lastSync).toLocaleString() : 'まだ同期は実行されていません'}
          </div>
          <button
            className="button button-glow"
            onClick={syncNow}
            disabled={syncState === 'syncing'}
          >
            すぐに同期
          </button>
        </div>
      </header>
      <Overview />
    </main>
  );
}

export default App;
