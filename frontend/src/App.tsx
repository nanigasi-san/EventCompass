import { Overview } from './views/Overview';
import { useDataContext } from './state/DataProvider';

function App(): JSX.Element {
  const { syncState, syncNow, lastSync } = useDataContext();

  const syncStatusLabel =
    syncState === 'syncing'
      ? '同期中...'
      : syncState === 'error'
        ? '同期できませんでした'
        : '最新の状態です';

  const syncStatusClassName = [
    'sync-status',
    syncState === 'error' ? 'error' : syncState === 'syncing' ? 'pending' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>EventCompass</h1>
          <p className="sidebar-subtitle">現場を導くサイバーオペレーション基盤</p>
        </div>
        <nav className="nav-links">
          <a href="#overview" className="nav-link">
            ダッシュボード
          </a>
          <a href="#members" className="nav-link">
            メンバーハブ
          </a>
          <a href="#materials" className="nav-link">
            資材レジストリ
          </a>
        </nav>
      </aside>
      <main className="content">
        <div className="top-bar">
          <div className="top-bar-status">
            <strong>同期ステータス</strong>
            <div className={syncStatusClassName}>{syncStatusLabel}</div>
            {lastSync ? (
              <div className="top-bar-meta">最終同期: {new Date(lastSync).toLocaleString()}</div>
            ) : null}
          </div>
          <button className="button glow" onClick={syncNow} disabled={syncState === 'syncing'}>
            今すぐ同期
          </button>
        </div>
        <Overview />
      </main>
    </div>
  );
}

export default App;
