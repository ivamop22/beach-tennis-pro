import { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';

export default function PlayerSelectModal() {
  const {
    state,
    dbPlayers,
    selectedSlot,
    setSelectedSlot,
    assignPlayerToSlot,
    playerSearch,
    setPlayerSearch,
    newPlayerFormOpen,
    setNewPlayerFormOpen,
    newPlayer,
    setNewPlayer,
    registerNewPlayer,
    toastMessage,
  } = useAppContext();

  const filteredPlayers = useMemo(() => {
    const query = playerSearch.toLowerCase();
    return dbPlayers.filter((player) => {
      const fullName = `${player.nome || ''} ${player.sobrenome || ''}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [dbPlayers, playerSearch]);

  if (selectedSlot === null) return null;

  const usedIds = new Set(state.players.filter((player) => player.dbId).map((player) => player.dbId));

  return (
    <div className="player-select-modal" onClick={() => setSelectedSlot(null)}>
      <div className="player-select-box" onClick={(e) => e.stopPropagation()}>
        <h3>🎾 Selecionar Jogador</h3>
        <div className="slot-info">Slot J{selectedSlot + 1} · Selecione um jogador cadastrado ou registre um novo</div>
        <div className="player-search-bar">
          <i className="fa fa-search"></i>
          <input value={playerSearch} onChange={(e) => setPlayerSearch(e.target.value)}
                 placeholder="Buscar jogador..."/>
        </div>
        <div className="db-players-list">
          {!filteredPlayers.length ? (
            <div className="no-players-msg">
              <i className="fa fa-user-slash .fonte-size-28-margin-bottom-8-display-block-opacity-4"></i>
              Nenhum jogador encontrado.</div>
          ) : filteredPlayers.map((player) => {
            const inUse = usedIds.has(player.id) && state.players[selectedSlot]?.dbId !== player.id;
            return (
                <div className="db-player-item" onClick={() => {
                  assignPlayerToSlot(selectedSlot, player);
                  setSelectedSlot(null);
                  setPlayerSearch('');
                  toastMessage(`✅ ${player.nome} adicionado ao Slot J${selectedSlot + 1}`);
                }}
                     key={player.id}
                     data-pid={player.id}>
                  <div>
                    <div className="p-name">{player.nome}{player.sobrenome ? ` ${player.sobrenome}` : ''}</div>
                    <div
                        className="p-meta">{player.idade ? `${player.idade} anos` : 'Sem idade'} {inUse ? '· Em uso' : ''}</div>
                    <i className="fa fa-check-circle check-icon"></i>
                  </div>
                </div>
            );
          })}
        </div>

        <div className="register-new-section">

          <div className={`register-new-toggle ${newPlayerFormOpen ? 'open' : ''}`} onClick={() => setNewPlayerFormOpen((current) => !current)}>
            <i className="fa fa-user-plus"></i>
            Cadastrar novo jogador
            <i className="fa fa-chevron-down margin-left-auto"></i>
          </div>
          {newPlayerFormOpen ? (
              <div className="new-player-form open">
                <div className="row">
                  <input placeholder="Nome *" value={newPlayer.nome}
                         onChange={(e) => setNewPlayer({...newPlayer, nome: e.target.value})}/>
                  <input placeholder="Sobrenome" value={newPlayer.sobrenome}
                         onChange={(e) => setNewPlayer({...newPlayer, sobrenome: e.target.value})}/>
                </div>
                <div className="row">
                  <input placeholder="Idade" value={newPlayer.idade}
                         onChange={(e) => setNewPlayer({...newPlayer, idade: e.target.value})}
                         className="max-width-100px"/>
                  <button className="btn btn-gold flex1-justify-content-center" onClick={registerNewPlayer}><i className="fa fa-save"></i> Salvar e
                    Selecionar
                  </button>
                </div>
              </div>
          ) : null
          }
        </div>

        <div className="psel-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSlot(null)}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}