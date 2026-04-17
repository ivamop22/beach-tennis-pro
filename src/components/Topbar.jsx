import { useAppContext } from '../contexts/AppContext';

export default function Topbar() {
  const { user, logout } = useAppContext();
  return (
    <div className="topbar">
      <div className="topbar-logo">
        <div className="logo-dot" />
        <div className="logo-text">ARENA GWM · BEACH TENNIS</div>
      </div>
      <div className="topbar-user">
        <span>{user?.user_metadata?.name || user?.email}</span>
        <button className="btn-logout" onClick={logout}><i className="fa fa-sign-out-alt"></i> Sair</button>
      </div>
    </div>
  );
}
