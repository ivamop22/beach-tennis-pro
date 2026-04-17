import { useAppContext } from '../contexts/AppContext';
import Topbar from '../components/Topbar';
import Navigation from '../components/Navigation';
import SetupPage from './SetupPage';
import BracketPage from './BracketPage';
import StatsPage from './StatsPage';
import RankingPage from './RankingPage';
import HistoryPage from './HistoryPage';
import PlayerSelectModal from '../components/PlayerSelectModal';

export default function DashboardPage() {
  const { activePage } = useAppContext();

  return (
    <div id="app">
      <Topbar />
      <Navigation />
      {activePage === 'setup' && <SetupPage />}
      {activePage === 'bracket' && <BracketPage />}
      {activePage === 'stats' && <StatsPage />}
      {activePage === 'ranking' && <RankingPage />}
      {activePage === 'history' && <HistoryPage />}
      <PlayerSelectModal />
    </div>
  );
}
