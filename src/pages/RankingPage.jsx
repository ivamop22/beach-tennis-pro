import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

function rankIcon(index) {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return `${index + 1}º`;
}

export default function RankingPage() {
  const { currentRanking, globalRanking, state } = useAppContext();
  const [mode, setMode] = useState('current');

  const rows = mode === 'current' ? currentRanking : globalRanking;

  return (
    <div className="page active">
      <div className="section-header"><div className="section-title"><i className="fa fa-trophy"></i> RANKING</div></div>
      <div className="card">
        <div className="ranking-page-card">
          <button className={`btn btn-sm ${mode === 'current' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setMode('current')}><i className="fa fa-flag"></i> Rodada Atual</button>
          <button className={`btn btn-sm ${mode === 'global' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setMode('global')}><i className="fa fa-globe"></i> Ranking Geral</button>
        </div>
      </div>


      {!rows.length ? (
        <div className="empty-state"><div className="icon">🏆</div><h3>Sem dados</h3><p>{mode === 'current' && !state.games.length ? 'Gere um torneio primeiro.' : 'Nenhuma rodada salva ainda.'}</p></div>
      ) : (
        <div className="card">
          <div className="card-title">
            <i className={` ${mode === 'current' ? 'fa fa-trophy' : 'fa fa-globe'}`}></i>
            {mode === 'current' ? 'Ranking – Rodada Atual' : 'Ranking Geral'}</div>

          <p className="ranking-icon">{` ${mode === 'current' ? 'Critérios: Saldo → Vitórias → Games Pró → Idade' : 'Critério: Game Average = GP / (GP+GC)'}`}
          </p>

          <div className="table-wrap">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jogador</th>
                  <th>J</th>
                  <th>V</th>
                  <th>GP</th>
                  <th>GC</th>
                  <th>Saldo</th>
                  {mode === 'global' ? <th>Avg</th> : null}
                </tr>
              </thead>
              <tbody>
                {rows.map((player, index) => (
                  <tr key={mode === 'current' ? player.code : `${player.nome}-${index}`}>
                    <td>{rankIcon(index)}</td>
                    <td><strong>{mode === 'current' ? player.nomeExibicao : `${player.nome}${player.sobrenome ? ` ${player.sobrenome}` : ''}`}</strong></td>
                    <td>{mode === 'current' ? player.jogos : player.total_jogos}</td>
                    <td>{mode === 'current' ? player.vit : player.total_vitorias}</td>
                    <td>{mode === 'current' ? player.gp : player.total_games_pro}</td>
                    <td>{mode === 'current' ? player.gc : player.total_games_contra}</td>
                    <td className={
                      (mode === 'current' ? player.saldo : player.saldo_games) >= 0 ? 'saldo-balance-positive' : 'saldo-balance-negative'
                    }>
                      <strong>
                        {mode === 'current'
                            ? (player.saldo >= 0 ? `+${player.saldo}` : player.saldo)
                            : (player.saldo_games >= 0 ? `+${player.saldo_games}` : player.saldo_games)}
                      </strong>
                    </td>
                    {mode === 'global' ? <td><strong className="color-gwm-gold">{Number(player.game_average).toFixed(3)}</strong></td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
