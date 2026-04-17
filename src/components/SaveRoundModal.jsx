import { useAppContext } from '../contexts/AppContext';

export default function SaveRoundModal() {
  const { saveModalOpen, setSaveModalOpen, roundName, setRoundName, state, timerSeconds, saveRound } = useAppContext();

  if (!saveModalOpen) return null;

  const completed = state.games.filter((game) => game.status === 'concluido').length;

  return (
    <div className="modal-overlay" onClick={() => setSaveModalOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3><i className="fa fa-save"></i> Salvar Rodada</h3>
        <p>{completed} de {state.games.length} partidas concluídas · {Math.round(timerSeconds / 60)} min de torneio</p>
        <input value={roundName} onChange={(e) => setRoundName(e.target.value)} placeholder="Nome da rodada" />
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => setSaveModalOpen(false)}>Cancelar</button>
          <button className="btn btn-gold" onClick={saveRound}><i className="fa fa-save"></i> Salvar</button>
        </div>
      </div>
    </div>
  );
}
