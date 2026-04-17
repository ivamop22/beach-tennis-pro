import { useAppContext } from './contexts/AppContext';
import { useTournamentTimer } from './hooks/useTournamentTimer';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import SaveRoundModal from './components/SaveRoundModal';
import Toast from './components/Toast';

export default function App() {
  const { loadingAuth, user, timerRunning, setTimerSeconds } = useAppContext();

  useTournamentTimer(timerRunning, setTimerSeconds);

  if (loadingAuth) {
    return (
      <div className="loading-overlay">
        <div className="loading-logo">
          <div className="brand">ARENA GWM</div>
          <div className="sub">Beach Tennis · Sistema de Chaveamento</div>
        </div>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      {user ? <DashboardPage /> : <AuthPage />}
      <SaveRoundModal />
      <Toast />
    </>
  );
}
