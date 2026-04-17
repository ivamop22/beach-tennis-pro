import { useMemo, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { VALID_PLAYER_COUNTS, getPlayerDisplayName } from '../utils/tournament';

function calcIdade(dataNascimento) {
  if (!dataNascimento) return null;
  const hoje = new Date();
  const nasc = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

export default function SetupPage() {
  const {
    state,
    selectPlayerCount,
    setSelectedSlot,
    removeSlot,
    loadAllSavedPlayers,
    generateTournament,
    dbPlayers,
    editingPlayer,
    setEditingPlayer,
    updatePlayer,
    deletePlayer,
    loadDbPlayers,
  } = useAppContext();

  const [editForm, setEditForm] = useState({ nome: '', sobrenome: '', data_nascimento: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showPlayerManager, setShowPlayerManager] = useState(false);

  const estimatedTime = useMemo(() => {
    if (!state.playerCount) return null;
    return { min: state.playerCount * 11, max: state.playerCount * 12 };
  }, [state.playerCount]);

  function openEdit(player) {
    setEditingPlayer(player);
    setEditForm({
      nome: player.nome || '',
      sobrenome: player.sobrenome || '',
      data_nascimento: player.data_nascimento || '',
    });
  }

  function handleSaveEdit() {
    if (!editForm.nome.trim()) return;
    updatePlayer(editingPlayer.id, editForm);
    loadDbPlayers();
  }

  function handleDelete(id) {
    if (confirmDeleteId === id) {
      deletePlayer(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  }

  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title"><i className="fa fa-cog"></i> CONFIGURAR TORNEIO</div>
      </div>

      {/* Gerenciar Jogadores Cadastrados */}
      <div className="card">
        <div
          className="card-title"
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => setShowPlayerManager((v) => !v)}
        >
          <i className="fa fa-users"></i> Gerenciar Jogadores Cadastrados
          <i className={`fa fa-chevron-${showPlayerManager ? 'up' : 'down'} margin-left-auto`}></i>
        </div>

        {showPlayerManager && (
          <div style={{ marginTop: '12px' }}>
            {!dbPlayers.length ? (
              <div className="card-hint">Nenhum jogador cadastrado ainda.</div>
            ) : (
              dbPlayers.map((player) => (
                <div key={player.id} style={{ borderBottom: '1px solid #2a2a2a', padding: '10px 0' }}>
                  {editingPlayer?.id === player.id ? (
                    <div>
                      <div className="row" style={{ gap: '8px', marginBottom: '6px' }}>
                        <input
                          placeholder="Nome *"
                          value={editForm.nome}
                          onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                        />
                        <input
                          placeholder="Sobrenome"
                          value={editForm.sobrenome}
                          onChange={(e) => setEditForm({ ...editForm, sobrenome: e.target.value })}
                        />
                      </div>
                      <div className="row" style={{ gap: '8px', marginBottom: '6px' }}>
                        <label style={{ fontSize: '12px', color: '#aaa', alignSelf: 'center' }}>Nasc.:</label>
                        <input
                          type="date"
                          value={editForm.data_nascimento}
                          onChange={(e) => setEditForm({ ...editForm, data_nascimento: e.target.value })}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-gold btn-sm" onClick={handleSaveEdit}>
                          <i className="fa fa-save"></i> Salvar
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingPlayer(null)}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{player.nome}{player.sobrenome ? ` ${player.sobrenome}` : ''}</div>
                        <div style={{ fontSize: '12px', color: '#aaa' }}>
                          {player.data_nascimento
                            ? `${calcIdade(player.data_nascimento)} anos · ${new Date(player.data_nascimento).toLocaleDateString('pt-BR')}`
                            : 'Sem data de nascimento'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(player)}>
                          <i className="fa fa-edit"></i>
                        </button>
                        {confirmDeleteId === player.id ? (
                          <>
                            <button
                              className="btn btn-sm"
                              style={{ background: '#e74c3c', color: '#fff', border: 'none' }}
                              onClick={() => handleDelete(player.id)}
                            >
                              <i className="fa fa-check"></i> Confirmar
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDeleteId(null)}>✕</button>
                          </>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: '#e74c3c' }}
                            onClick={() => handleDelete(player.id)}
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Número de Jogadores */}
      <div className="card">
        <div className="card-title"><i className="fa fa-users"></i> Número de Jogadores</div>
        <div className="count-grid">
          {VALID_PLAYER_COUNTS.map((count) => (
            <button
              key={count}
              className={`count-btn ${state.playerCount === count ? 'active' : ''}`}
              onClick={() => selectPlayerCount(count)}
            >
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

      {/* Slots de Jogadores */}
      {state.playerCount ? (
        <div className="card">
          <div className="card-title">Jogadores do Torneio</div>
          <div className="card-hint">
            <i className="fa fa-info-circle"></i>
            Clique em um slot para selecionar jogadores da base de dados ou cadastrar novos.
          </div>
          <div className="player-grid">
            {state.players.map((player, index) => (
              <div
                key={player.code}
                className={`player-slot ${player.nome ? 'filled' : ''}`}
                onClick={() => setSelectedSlot(index)}
              >
                <div className="slot-num"><i className="fa fa-user"></i> J{index + 1}</div>
                {player.nome ? (
                  <>
                    <div className="slot-name">{getPlayerDisplayName(player)}</div>
                    <div className="slot-sub">
                      {player.data_nascimento
                        ? `${calcIdade(player.data_nascimento)} anos · ${new Date(player.data_nascimento).toLocaleDateString('pt-BR')}`
                        : 'Sem data de nascimento'}
                    </div>
                    <button
                      className="remove-btn"
                      onClick={(event) => { event.stopPropagation(); removeSlot(index); }}
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
