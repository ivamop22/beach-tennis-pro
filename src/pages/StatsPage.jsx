import { useAppContext } from '../contexts/AppContext';

function rankIcon(index) {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return `${index + 1}º`;
}

export default function StatsPage() {
  const { stats, state } = useAppContext();

  if (!state.games.length) {
    return (
      <div className="page active">
        <div className="section-header"><div className="section-title"><i className="fa fa-chart-bar"></i> ESTATÍSTICAS</div></div>
        <div className="empty-state"><div className="icon">📊</div><h3>Sem dados</h3><p>Jogue algumas partidas primeiro</p></div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="section-header"><div className="section-title"><i className="fa fa-chart-bar"></i> ESTATÍSTICAS</div></div>
      <div className="card">
        <div className="card-title"><i className="fa fa-chart-bar"></i> Desempenho dos Jogadores</div>
        <div className="table-wrap">
          <table className="stats-table">
            <thead>
              <tr><th>#</th><th>Jogador</th><th>Jogos</th><th>Vitórias</th><th>GP</th><th>GC</th><th>Saldo</th></tr>
            </thead>
            <tbody>
              {stats.map((player, index) => (
                <tr key={player.code}>
                  <td>{rankIcon(index)}</td>
                  <td><strong>{player.nomeExibicao}</strong><br /><span className="muted-mini">{player.code}</span></td>
                  <td><span className="badge badge-gold">{player.jogos}</span></td>
                    <td><span className="badge badge-green">{player.vit}</span></td>
                  <td>{player.gp}</td>
                  <td>{player.gc}</td>
                    <td><strong className={player.saldo >= 0 ? 'saldo-balance-positive' : 'saldo-balance-negative'}>
                        {player.saldo >= 0 ? '+' : ''}{player.saldo}
                    </strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-title"><i className="fa fa-handshake"></i> Parceiros por Jogador</div>
        {stats.map((player) => (
          <div key={player.code} className="partners-block">
            <strong className="partners-name-card">{player.code} – {player.nomeExibicao}</strong>
            <div className="partner-list">
              {player.partners.map((partner) => <span className="partner-chip" key={partner}>{partner}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/*
<td><strong className={}>{player.saldo >= 0 ? `+${player.saldo}` : player.saldo}</strong></td>
 */