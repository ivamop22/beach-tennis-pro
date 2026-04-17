import { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { MAX_TOURNAMENT_SECONDS, getPlayerShortName, statusLabel } from '../utils/tournament';

function formatSeconds(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function BracketPage() {
  const {
    state,
    timerSeconds,
    timerRunning,
    setTimerRunning,
    setActivePage,
    updateGameScore,
    setSaveModalOpen,
  } = useAppContext();

  const completedGames = useMemo(() => state.games.filter((game) => game.status === 'concluido').length, [state.games]);
  const inProgressGames = useMemo(() => state.games.filter((game) => game.status === 'andamento').length, [state.games]);
  const progress = Math.min(100, (timerSeconds / MAX_TOURNAMENT_SECONDS) * 100);

  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title"><i className="fa fa-sitemap"></i> PARTIDAS</div>
        <div className="rodada-info-row">
          <button className="btn btn-ghost btn-sm" onClick={() => setActivePage('setup')}><i className="fa fa-arrow-left"></i> Voltar</button>
          {state.games.length ? (
            <button className="btn btn-green btn-sm" onClick={() => setSaveModalOpen(true)}><i className="fa fa-save"></i> Salvar Rodada</button>
          ) : null}
        </div>
      </div>

      {state.games.length ? (
        <div className="timer-display">
          <div className="timer-clock">{formatSeconds(timerSeconds)}</div>
          <div className="timer-info">
            <p><i className="fa fa-stopwatch"></i> Tempo do Torneio</p>
            <div className="timer-progress"><div className="timer-progress-fill" style={{ width: `${progress}%` }} /></div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setTimerRunning((current) => !current)}>
            {timerRunning
                ? (<><i className="fa fa-pause"></i> Pausar</>)
                : (<><i className="fa fa-play"></i> Iniciar</>)
            }
          </button>
        </div>
      ) : null}

      <div className="info-row">
        <div className="info-pill">Jogadores: <span>{state.playerCount || 0}</span></div>
        <div className="info-pill">Partidas: <span>{state.games.length}</span></div>
        <div className="info-pill">Concluídas: <span>{completedGames}</span></div>
        <div className="info-pill">Em andamento: <span>{inProgressGames}</span></div>
      </div>

      <div className="games-list">
        {!state.games.length ? (
          <div className="empty-state">
            <div className="icon">🏆</div>
            <h3>Nenhum torneio gerado</h3>
            <p>Configure os jogadores e gere o chaveamento</p>
          </div>
        ) : (
          state.games.map((game) => {
            const [team1, team2] = game.teams;
            const scoreDone = game.status === 'concluido';
            return (
              <div key={game.id} className={`game-card status-${game.status}`}>
                <div className="game-header">
                  <span className="game-num"><i className="fa fa-circle-notch"></i>  PARTIDA {game.id}</span>
                  <span className={`game-status status-${game.status}`}>{statusLabel(game.status)}</span>
                </div>
                <div className="game-body">
                  <div className="team-side">
                    <div className="team-names">
                      <span className="pcode">J{team1[0]}</span>{getPlayerShortName(state.players.find((item) => item.id === team1[0]))}<br />
                      <span className="pcode">J{team1[1]}</span>{getPlayerShortName(state.players.find((item) => item.id === team1[1]))}
                    </div>
                  </div>

                  <div className="score-area">
                    {scoreDone ? (
                      <div className="score-display">{game.score[0]}×{game.score[1]}</div>
                    ) : (
                      <div className="score-inputs">
                        {[0, 1].map((teamIndex) => (
                          <div key={teamIndex} className="score-ctrl">
                            <button className="score-btn" onClick={() => updateGameScore(game.id, teamIndex, 1)}>+</button>
                            <div className="score-num">{game.score[teamIndex]}</div>
                            <button className="score-btn" onClick={() => updateGameScore(game.id, teamIndex, -1)}>−</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="team-side">
                    <div className="team-names">
                      <span className="pcode">J{team2[0]}</span>{getPlayerShortName(state.players.find((item) => item.id === team2[0]))}<br />
                      <span className="pcode">J{team2[1]}</span>{getPlayerShortName(state.players.find((item) => item.id === team2[1]))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
