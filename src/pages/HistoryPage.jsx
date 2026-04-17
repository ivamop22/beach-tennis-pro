import { useAppContext } from '../contexts/AppContext';
import HistoryPageDetail from './HistoryPageDetail.jsx';
import { useState } from 'react';

export default function HistoryPage() {
  const { rounds, deleteRound, roundHistoryFormOpen, setRoundHistoryFormOpen } = useAppContext();
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  function handleDelete(e, roundId) {
    e.stopPropagation();
    if (confirmDeleteId === roundId) {
      deleteRound(roundId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(roundId);
    }
  }

  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title"><i className="fa fa-history"></i> HISTÓRICO</div>
      </div>
      {!rounds.length ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>Nenhum torneio salvo</h3>
        </div>
      ) : (
        rounds.map((round) => (
          <div
            key={round.id}
            className="history-item"
            onClick={() => { setSelectedRoundId(round.id); setRoundHistoryFormOpen(!roundHistoryFormOpen); }}
          >
            <div className="history-meta">
              <span className="history-date">{new Date(round.created_at).toLocaleString('pt-BR')}</span>
              <span className="badge badge-gold">{round.player_count} jogadores</span>
            </div>
            <strong>{round.name || 'Torneio sem nome'}</strong>
            <div className="slot-sub"><i className="fa fa-clock"></i> {Math.round((round.duration_seconds || 0) / 60)} min</div>

            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
              {confirmDeleteId === round.id ? (
                <>
                  <span style={{ fontSize: '12px', color: '#e74c3c', alignSelf: 'center' }}>Confirmar exclusão?</span>
                  <button
                    className="btn btn-sm"
                    style={{ background: '#e74c3c', color: '#fff', border: 'none' }}
                    onClick={(e) => handleDelete(e, round.id)}
                  >
                    <i className="fa fa-check"></i> Sim, excluir
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#e74c3c' }}
                  onClick={(e) => handleDelete(e, round.id)}
                >
                  <i className="fa fa-trash"></i> Excluir
                </button>
              )}
            </div>
          </div>
        ))
      )}
      {roundHistoryFormOpen ? <HistoryPageDetail roundId={selectedRoundId} /> : null}
    </div>
  );
}
