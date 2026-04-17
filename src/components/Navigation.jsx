import { useAppContext } from '../contexts/AppContext';

const pages = [
  ['setup', 'Configurar', 'fa fa-cog'],
  ['bracket', 'Partidas', 'fa fa-sitemap'],
  ['stats', 'Estatísticas', 'fa fa-chart-bar'],
  ['ranking', 'Ranking', 'fa fa-trophy'],
  ['history', 'Histórico', 'fa fa-history'],
];

export default function Navigation() {
  const { activePage, setActivePage } = useAppContext();
  return (
    <nav className="nav">
      {pages.map(([key, label, iconName]) => (
          <button key={key} className={`nav-btn ${activePage === key ? 'active' : ''}`}
                  onClick={() => setActivePage(key)}>
            <i className={iconName}></i>
            {label}
          </button>
      ))}
    </nav>
  );
}
