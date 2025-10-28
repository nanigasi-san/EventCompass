import { NavLink, Route, Routes } from 'react-router-dom';
import { MembersView } from './views/MembersView';
import { MaterialsView } from './views/MaterialsView';
import { Overview } from './views/Overview';
import { useDataContext } from './state/DataProvider';

const navClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link active' : 'nav-link';

function App(): JSX.Element {
  const { syncState, syncNow, lastSync } = useDataContext();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>EventCompass</h1>
        <p>ローカル FastAPI と連携するオフライン対応ダッシュボード</p>
        <div className="nav-links">
          <NavLink to="/" className={navClassName} end>
            ダッシュボード
          </NavLink>
          <NavLink to="/members" className={navClassName}>
            メンバー管理
          </NavLink>
          <NavLink to="/materials" className={navClassName}>
            資材管理
          </NavLink>
        </div>
      </aside>
      <main className="content">
        <div className="top-bar">
          <div>
            <strong>同期状態</strong>
            <div
              className={['sync-status', syncState === 'error' ? 'error' : syncState === 'syncing' ? 'pending' : '']
                .filter(Boolean)
                .join(' ')}
            >
              {syncState === 'idle' && '最新の状態です'}
              {syncState === 'syncing' && '同期中...'}
              {syncState === 'error' && '同期に失敗しました'}
            </div>
            {lastSync ? (
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                最終同期: {new Date(lastSync).toLocaleString()}
              </div>
            ) : null}
          </div>
          <button className="button" onClick={syncNow} disabled={syncState === 'syncing'}>
            今すぐ同期
          </button>
        </div>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/members" element={<MembersView />} />
          <Route path="/materials" element={<MaterialsView />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
