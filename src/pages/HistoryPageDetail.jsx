import {useAppContext} from '../contexts/AppContext';
import {useEffect, useState} from "react";
import {supabase} from "../lib/supabase.js";

function rankIcon(index) {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}º`;
}

export default function HistoryPageDetail({roundId}) {
    const {rounds, toastMessage, roundHistoryFormOpen, setRoundHistoryFormOpen, setSelectedRoundId} = useAppContext();
    const [sorted, setSorted] = useState([]);

    useEffect(() => {
        if (!roundId) return;

        const fetchData = async () => {
            const { data, error } = await supabase
                .from('round_players')
                .select('*')
                .eq('round_id', roundId)
                .order('vitorias', { ascending: false });

            if (error || !data) return;

            const sortedData = [...data].sort((a, b) => {
                const sA = a.games_pro - a.games_contra;
                const sB = b.games_pro - b.games_contra;
                if (sB !== sA) return sB - sA;
                return b.vitorias - a.vitorias;
            });

            setSorted(sortedData);
        };

        fetchData();
    }, [roundId]);

    return (
        <>
            <div className="modal-overlay display-flex" onClick={() => setRoundHistoryFormOpen(false)}>
                <div className="modal">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3><i className="fa fa-clipboard-list"></i> Detalhes da Rodada</h3>
                        <div style={{overflowX: 'auto'}}>
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
                                </tr>
                                </thead>
                                <tbody>
                                {sorted.map((s, i) => {
                                    const saldo = s.games_pro - s.games_contra;
                                    return (
                                        <tr key={s.id ?? i}>
                                            <td>{rankIcon(i)}</td>
                                            <td>{s.nome}{s.sobrenome ? ` ${s.sobrenome}` : ''}</td>
                                            <td>{s.jogos}</td>
                                            <td>{s.vitorias}</td>
                                            <td>{s.games_pro}</td>
                                            <td>{s.games_contra}</td>
                                            <td className={saldo >= 0 ? 'positive' : 'negative'}>
                                                <strong>{saldo >= 0 ? '+' : ''}{saldo}</strong>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-ghost" onClick={() => setRoundHistoryFormOpen(false)}>
                                <i className="fa fa-times"></i> Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}