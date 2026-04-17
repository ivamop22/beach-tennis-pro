import { useAppContext } from '../contexts/AppContext';
import HistoryPageDetail from "./HistoryPageDetail.jsx";
import {useState} from "react";

export default function HistoryPage() {
  const { rounds, toastMessage, roundHistoryFormOpen, setRoundHistoryFormOpen } = useAppContext();
  const [ selectedRoundId, setSelectedRoundId ] = useState(null);

  return (
    <div className="page active">
      <div className="section-header"><div className="section-title"><i className="fa fa-history"></i> HISTÓRICO</div></div>
      {!rounds.length ? (
        <div className="empty-state"><div className="icon">📋</div><h3>Nenhuma rodada salva</h3></div>
      ) : (
        rounds.map((round) => (
          <div key={round.id} className="history-item" onClick={() => {setSelectedRoundId(round.id); setRoundHistoryFormOpen(!roundHistoryFormOpen);} }>
              <div className="history-meta">
                  <span className="history-date">{new Date(round.created_at).toLocaleString('pt-BR')}</span>
                  <span className="badge badge-gold">{round.player_count} jogadores</span>
              </div>

              <strong>{round.name || 'Rodada sem nome'}</strong>
              <div className="slot-sub"><i className="fa fa-clock"></i> {Math.round((round.duration_seconds || 0) / 60)} min</div>
          </div>
        ))
      )}
        {roundHistoryFormOpen ? <HistoryPageDetail roundId={selectedRoundId}/> : null }
    </div>
  );
}