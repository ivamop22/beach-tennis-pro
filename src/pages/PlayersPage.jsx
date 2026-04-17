import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

function calcIdade(dataNascimento) {
  if (!dataNascimento) return null;
  const hoje = new Date();
  const nasc = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

export default function PlayersPage() {
  const {
    dbPlayers,
    editingPlayer,
    setEditingPlayer,
    updatePlayer,
    deletePlayer,
    loadDbPlayers,
    newPlayerFormOpen,
    setNewPlayerFormOpen,
    newPlayer,
    setNewPlayer,
    registerNewPlayer,
  } = useAppContext();

  const [editForm, setEditForm] = useState({ nome: '', sobrenome: '', data_nascimento: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [search, setSearch] = useState('');

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
  }

  function handleDelete(id) {
    if (confirmDeleteId === id) {
      deletePlayer(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  }

  const filtered = dbPlayers.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.nome || '').toLowerCase().includes(q) ||
      (p.sobrenome || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title"><i className="fa fa-users"></i> JOGADORES</div>
      </div>

      {/* Cadastrar novo jogador */}
      <div className="card">
        <div
          className="card-title"
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => setNewPlayerFormOpen((v) => !v)}
        >
          <i className="fa fa-user-plus"></i> Cadastrar Novo Jogador
          <i className={`fa fa-chevron-${newPlayerFormOpen ? 'up' : 'down'}`} style={{ marginLeft: 'auto' }}></i>
        </div>

        {newPlayerFormOpen && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                placeholder="Nome *"
                value={newPlayer.nome}
                onChange={(e) => setNewPlayer({ ...newPlayer, nome: e.target.value })}
                style={{ flex: 1 }}
              />
              <input
                placeholder="Sobrenome"
                value={newPlayer.sobrenome}
                onChange={(e) => setNewPlayer({ ...newPlayer, sobrenome: e.target.value })}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap' }}>Data de Nasc.:</label>
              <input
                type="date"
                value={newPlayer.data_nascimento}
                onChange={(e) => setNewPlayer({ ...newPlayer, data_nascimento: e.target.value })}
                style={{ flex: 1 }}
              />
            </div>
            <button className="btn btn-gold" onClick={registerNewPlayer}>
              <i className="fa fa-save"></i> Salvar Jogador
            </button>
          </div>
        )}
      </div>

      {/* Lista de jogadores */}
      <div className="card">
        <div className="card-title"><i className="fa fa-list"></i> Jogadores Cadastrados ({dbPlayers.length})</div>

        {dbPlayers.length > 3 && (
          <input
            placeholder="🔍 Buscar jogador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: '12px', width: '100%' }}
          />
        )}

        {!filtered.length ? (
          <div className="empty-state">
            <div className="icon">👤</div>
            <h3>{dbPlayers.length ? 'Nenhum resultado encontrado' : 'Nenhum jogador cadastrado'}</h3>
            <p>{!dbPlayers.length && 'Clique em "Cadastrar Novo Jogador" acima para começar.'}</p>
          </div>
        ) : (
          filtered.map((player) => (
            <div key={player.id} style={{ borderBottom: '1px solid #2a2a2a', padding: '12px 0' }}>
              {editingPlayer?.id === player.id ? (
                /* Modo Edição */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      placeholder="Nome *"
                      value={editForm.nome}
                      onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                      style={{ flex: 1 }}
                    />
                    <input
                      placeholder="Sobrenome"
                      value={editForm.sobrenome}
                      onChange={(e) => setEditForm({ ...editForm, sobrenome: e.target.value })}
                      style={{ flex: 1 }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap' }}>Data de Nasc.:</label>
                    <input
                      type="date"
                      value={editForm.data_nascimento}
                      onChange={(e) => setEditForm({ ...editForm, data_nascimento: e.target.value })}
                      style={{ flex: 1 }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-gold btn-sm" onClick={handleSaveEdit}>
                      <i className="fa fa-save"></i> Salvar
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingPlayer(null)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* Modo Visualização */
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                      {player.nome}{player.sobrenome ? ` ${player.sobrenome}` : ''}
                    </div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                      {player.data_nascimento
                        ? `${calcIdade(player.data_nascimento)} anos · ${new Date(player.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')}`
                        : 'Sem data de nascimento'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(player)} title="Editar">
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
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#e74c3c' }}
                        onClick={() => handleDelete(player.id)}
                        title="Excluir"
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
    </div>
  );
}
