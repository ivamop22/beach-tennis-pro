import { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { VALID_PLAYER_COUNTS, getPlayerDisplayName } from '../utils/tournament';

export default function SetupPage() {
  const {
    state,
    selectPlayerCount,
    setSelectedSlot,
    removeSlot,
    loadAllSavedPlayers,
    generateTournament,
  } = useAppContext();

  const estimatedTime = useMemo(() => {
    if (!state.playerCount) return null;
    return { min: state.playerCount * 11, max: state.playerCount * 12 };
  }, [state.playerCount]);

  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title"><i className="fa fa-cog"></i> CONFIGURAR TORNEIO</div>
      </div>

      <div className="card">
        <div className="card-title"><i className="fa fa-users"></i> Número de Jogadores</div>
        <div className="count-grid">
          {VALID_PLAYER_COUNTS.map((count) => (
            <button key={count} className={`count-btn ${state.playerCount === count ? 'active' : ''}`} onClick={() => selectPlayerCount(count)}>
              {count}
              <span className="lbl">jogadores</span>
            </button>
          ))}
        </div>

        {estimatedTime ? (
          <div className="alert-info">
            <div>
              <strong>{state.playerCount} jogadores</strong> · <strong>{state.playerCount} partidas</strong> · <strong>4 jogos/jogador</strong> · Tempo estimado: <strong>{estimatedTime.min}–{estimatedTime.max} min</strong>
            </div>
          </div>
        ) : null}
      </div>

      {state.playerCount ? (
        <div className="card">
          <div className="card-title">Jogadores do Torneio</div>
          <div className="card-hint">
            <i className="fa fa-info-circle"></i>
            Clique em um slot para selecionar jogadores da base de dados ou cadastrar novos.</div>
          <div className="player-grid">
            {state.players.map((player, index) => (
              <div key={player.code} className={`player-slot ${player.nome ? 'filled' : ''}`} onClick={() => setSelectedSlot(index)}>
                <div className="slot-num"><i className="fa fa-user"></i> J{index + 1}</div>
                {player.nome ? (
                  <>
                    <div className="slot-name">{getPlayerDisplayName(player)}</div>
                    <div className="slot-sub">{player.idade ? `${player.idade} anos` : 'Sem idade'}</div>
                    <button
                      className="remove-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeSlot(index);
                      }}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </>
                ) : (
                  <div className="slot-empty"><i className="fa fa-plus-circle"></i> Selecionar jogador</div>
                )}
              </div>
            ))}
          </div>

          <div className="info-row">
            <button className="btn btn-gold" onClick={generateTournament}><i className="fa fa-random"></i> Gerar Chaveamento</button>
            <button className="btn btn-ghost" onClick={loadAllSavedPlayers}><i className="fa fa-database"></i> Carregar Todos os Salvos</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}