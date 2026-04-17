import { useMemo, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

function calcIdade(dataNascimento) {
  if (!dataNascimento) return null;
  const hoje = new Date();
  const nasc = new Date(dataNascimento + 'T00:00:00');
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

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
    deletePlayer,
    toastMessage,
  } = useAppContext();

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filteredPlayers = useMemo(() => {
    const query = playerSearch.toLowerCase();
    return dbPlayers.filter((player) => {
      const fullName = `${player.nome || ''} ${player.sobrenome || ''}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [dbPlayers, playerSearch]);

  if (selectedSlot === null) return null;

  const usedIds = new Set(state.players.filter((p) => p.dbId).map((p) => p.dbId));

  function handleDelete(e, playerId) {
    e.stopPropagation();
    if (confirmDeleteId === playerId) {
      deletePlayer(playerId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(playerId);
    }
  }

  return (
    <div className="player-select-modal" onClick={() => { setSelectedSlot(null); setConfirmDeleteId(null); }}>
      <div className="player-select-box" onClick={(e) => e.stopPropagation()}>
        <h3>🎾 Selecionar Jogador</h3>
        <div className="slot-info">Slot J{selectedSlot + 1} · Selecione um jogador cadastrado ou registre um novo</div>

        <div className="player-search-bar">
          <i className="fa fa-search"></i>
          <input
            value={playerSearch}
            onChange={(e) => setPlayerSearch(e.target.value)}
            placeholder="Buscar jogador..."
          />
        </div>

        <div className="db-players-list">
          {!filteredPlayers.length ? (
            <div className="no-players-msg">
              <i className="fa fa-user-slash"></i> Nenhum jogador encontrado.
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const inUse = usedIds.has(player.id) && state.players[selectedSlot]?.dbId !== player.id;
              const idade = calcIdade(player.data_nascimento);

              return (
                <div
                  key={player.id}
                  className="db-player-item"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onClick={() => {
                    if (confirmDeleteId === player.id) return;
                    assignPlayerToSlot(selectedSlot, player);
                    setSelectedSlot(null);
                    setPlayerSearch('');
                    toastMessage(`✅ ${player.nome} adicionado ao Slot J${selectedSlot + 1}`);
                  }}
                  data-pid={player.id}
                >
                  {/* Info do jogador */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="p-name">
                      {player.nome}{player.sobrenome ? ` ${player.sobrenome}` : ''}
                    </div>
                    <div className="p-meta">
                      {player.data_nascimento
                        ? `${idade} anos · ${new Date(player.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')}`
                        : 'Sem data de nascimento'}
                      {inUse ? ' · ⚠️ Em uso' : ''}
                    </div>
                  </div>

                  {/* Botões de excluir */}
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '8px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    {confirmDeleteId === player.id ? (
                      <>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#e74c3c', color: '#fff', border: 'none', fontSize: '11px', padding: '4px 8px' }}
                          onClick={(e) => handleDelete(e, player.id)}
                        >
                          <i className="fa fa-check"></i> Confirmar
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#e74c3c', fontSize: '13px', padding: '4px 8px' }}
                        onClick={(e) => handleDelete(e, player.id)}
                        title="Excluir jogador"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cadastrar novo jogador */}
        <div className="register-new-section">
          <div
            className={`register-new-toggle ${newPlayerFormOpen ? 'open' : ''}`}
            onClick={() => setNewPlayerFormOpen((current) => !current)}
          >
            <i className="fa fa-user-plus"></i>
            Cadastrar novo jogador
            <i className="fa fa-chevron-down margin-left-auto"></i>
          </div>
          {newPlayerFormOpen && (
            <div className="new-player-form open">
              <div className="row">
                <input
                  placeholder="Nome *"
                  value={newPlayer.nome}
                  onChange={(e) => setNewPlayer({ ...newPlayer, nome: e.target.value })}
                />
                <input
                  placeholder="Sobrenome"
                  value={newPlayer.sobrenome}
                  onChange={(e) => setNewPlayer({ ...newPlayer, sobrenome: e.target.value })}
                />
              </div>
              <div className="row">
                <label style={{ fontSize: '12px', color: '#aaa', marginRight: '4px' }}>Data de Nasc.</label>
                <input
                  type="date"
                  value={newPlayer.data_nascimento}
                  onChange={(e) => setNewPlayer({ ...newPlayer, data_nascimento: e.target.value })}
                  className="max-width-160px"
                />
                <button className="btn btn-gold flex1-justify-content-center" onClick={registerNewPlayer}>
                  <i className="fa fa-save"></i> Salvar e Selecionar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="psel-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedSlot(null); setConfirmDeleteId(null); }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
