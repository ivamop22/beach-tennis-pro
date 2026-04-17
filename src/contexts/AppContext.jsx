import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  calculateStats,
  createEmptyPlayers,
  generateTournamentGames,
  sortCurrentRanking,
  VALID_PLAYER_COUNTS,
} from '../utils/tournament';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activePage, setActivePage] = useState('setup');
  const [toast, setToast] = useState('');
  const [dbPlayers, setDbPlayers] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [globalRanking, setGlobalRanking] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [roundName, setRoundName] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [playerSearch, setPlayerSearch] = useState('');
  const [newPlayerFormOpen, setNewPlayerFormOpen] = useState(false);
  const [roundHistoryFormOpen, setRoundHistoryFormOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ nome: '', sobrenome: '', idade: '' });
  const [state, setState] = useState({
    playerCount: 0,
    players: [],
    games: [],
    active: false,
  });

  const toastMessage = useCallback((message) => {
    setToast(message);
    window.clearTimeout(window.__arenaToastTimeout);
    window.__arenaToastTimeout = window.setTimeout(() => setToast(''), 2600);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;
        setUser(session?.user || null);
      } finally {
        if (mounted) setLoadingAuth(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoadingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadDbPlayers = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('players').select('*').eq('user_id', user.id).order('nome');
    if (!error && data) setDbPlayers(data);
  }, [user]);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('rounds').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (!error && data) setRounds(data);
  }, [user]);

  const loadGlobalRanking = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('ranking_global')
      .select('*')
      .eq('user_id', user.id)
      .order('game_average', { ascending: false });
    if (!error && data) setGlobalRanking(data);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setDbPlayers([]);
      setRounds([]);
      setGlobalRanking([]);
      return;
    }
    loadDbPlayers();
    loadHistory();
    loadGlobalRanking();
  }, [user, loadDbPlayers, loadHistory, loadGlobalRanking]);

  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setActivePage('setup');
  }, []);

  const selectPlayerCount = useCallback((count) => {
    if (!VALID_PLAYER_COUNTS.includes(count)) return;
    setState((current) => ({
      ...current,
      playerCount: count,
      players: current.players.length === count ? current.players : createEmptyPlayers(count),
    }));
  }, []);

  const assignPlayerToSlot = useCallback((index, player) => {
    setState((current) => {
      const nextPlayers = [...current.players];
      nextPlayers[index] = {
        id: index + 1,
        code: `J${index + 1}`,
        nome: player.nome || '',
        sobrenome: player.sobrenome || '',
        idade: player.idade || '',
        dbId: player.id || player.dbId || null,
      };
      return { ...current, players: nextPlayers };
    });
  }, []);

  const removeSlot = useCallback((index) => {
    setState((current) => {
      const nextPlayers = [...current.players];
      nextPlayers[index] = {
        id: index + 1,
        code: `J${index + 1}`,
        nome: '',
        sobrenome: '',
        idade: '',
        dbId: null,
      };
      return { ...current, players: nextPlayers };
    });
  }, []);

  const registerNewPlayer = useCallback(async () => {
    if (!user || !newPlayer.nome.trim()) {
      toastMessage('⚠️ Nome é obrigatório.');
      return;
    }

    const { data, error } = await supabase
      .from('players')
      .insert([
        {
          user_id: user.id,
          nome: newPlayer.nome.trim(),
          sobrenome: newPlayer.sobrenome.trim(),
          idade: newPlayer.idade ? parseInt(newPlayer.idade, 10) : null,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      toastMessage(`❌ ${error.message}`);
      return;
    }

    setDbPlayers((current) => [...current, data].sort((a, b) => (a.nome || '').localeCompare(b.nome || '')));
    if (selectedSlot !== null) assignPlayerToSlot(selectedSlot, data);
    setSelectedSlot(null);
    setNewPlayerFormOpen(false);
    setNewPlayer({ nome: '', sobrenome: '', idade: '' });
    toastMessage(`✅ ${data.nome} cadastrado e selecionado!`);
  }, [assignPlayerToSlot, newPlayer, selectedSlot, toastMessage, user]);

  const loadAllSavedPlayers = useCallback(async () => {
    await loadDbPlayers();
    setState((current) => {
      const nextPlayers = [...current.players];
      dbPlayers.slice(0, current.playerCount).forEach((player, index) => {
        nextPlayers[index] = {
          id: index + 1,
          code: `J${index + 1}`,
          nome: player.nome || '',
          sobrenome: player.sobrenome || '',
          idade: player.idade || '',
          dbId: player.id,
        };
      });
      return { ...current, players: nextPlayers };
    });
    toastMessage(`✅ ${Math.min(dbPlayers.length, state.playerCount)} jogadores carregados!`);
  }, [dbPlayers, loadDbPlayers, state.playerCount, toastMessage]);

  const generateTournament = useCallback(() => {
    if (!state.playerCount) {
      toastMessage('⚠️ Selecione o número de jogadores.');
      return;
    }

    const normalizedPlayers = state.players.map((player, index) =>
      player.nome ? player : { ...player, nome: `Jogador${index + 1}` },
    );

    const games = generateTournamentGames(state.playerCount);
    if (!games) {
      toastMessage('❌ Não foi possível gerar o chaveamento.');
      return;
    }

    setState({
      playerCount: state.playerCount,
      players: normalizedPlayers,
      games,
      active: true,
    });
    setTimerRunning(false);
    setTimerSeconds(0);
    setActivePage('bracket');
  }, [state, toastMessage]);

  const updateGameScore = useCallback((gameId, teamIndex, delta) => {
    setState((current) => {
      const games = current.games.map((game) => {
        if (game.id !== gameId || game.status === 'concluido') return game;
        const score = [...game.score];
        const nextValue = score[teamIndex] + delta;
        if (nextValue < 0 || nextValue > 4) return game;
        if (nextValue === 4 && score[1 - teamIndex] === 4) return game;
        score[teamIndex] = nextValue;

        let status = game.status;
        if (score[0] > 0 || score[1] > 0) status = 'andamento';
        if ((score[0] === 4 || score[1] === 4) && score[0] !== score[1]) status = 'concluido';

        return { ...game, score, status };
      });
      return { ...current, games };
    });
  }, []);

  const stats = useMemo(() => calculateStats(state.players, state.games), [state.players, state.games]);
  const currentRanking = useMemo(() => sortCurrentRanking(stats), [stats]);

  const saveRound = useCallback(async () => {
    if (!user) return;

    const name = roundName.trim() || `Rodada ${new Date().toLocaleDateString('pt-BR')}`;
    const players = stats.map((player, index) => ({
      player_index: index + 1,
      nome: player.nome.replace(/\.$/, '').trim(),
      sobrenome: state.players[index]?.sobrenome || '',
      idade: parseInt(state.players[index]?.idade, 10) || null,
      jogos: player.jogos,
      vitorias: player.vit,
      games_pro: player.gp,
      games_contra: player.gc,
    }));

    const games = state.games.map((game) => ({
      game_number: game.id,
      t1p1: game.teams[0][0],
      t1p2: game.teams[0][1],
      t2p1: game.teams[1][0],
      t2p2: game.teams[1][1],
      score1: game.score[0],
      score2: game.score[1],
      status: game.status,
    }));

    const { error } = await supabase.rpc('save_round', {
      p_user_id: user.id,
      p_name: name,
      p_player_count: state.playerCount,
      p_duration: timerSeconds,
      p_players: players,
      p_games: games,
    });

    if (error) {
      toastMessage(`❌ Erro ao salvar: ${error.message}`);
      return;
    }

    setSaveModalOpen(false);
    setRoundName('');
    toastMessage('✅ Rodada salva com sucesso!');
    loadHistory();
    loadGlobalRanking();
  }, [loadGlobalRanking, loadHistory, roundName, state.games, state.playerCount, state.players, stats, timerSeconds, toastMessage, user]);

  const value = {
    user,
    loadingAuth,
    activePage,
    setActivePage,
    toast,
    toastMessage,
    dbPlayers,
    rounds,
    globalRanking,
    timerSeconds,
    setTimerSeconds,
    timerRunning,
    setTimerRunning,
    saveModalOpen,
    setSaveModalOpen,
    roundName,
    setRoundName,
    selectedSlot,
    setSelectedSlot,
    playerSearch,
    setPlayerSearch,
    newPlayerFormOpen,
    setNewPlayerFormOpen,
    newPlayer,
    setNewPlayer,
    state,
    stats,
    currentRanking,
    login,
    register,
    logout,
    selectPlayerCount,
    assignPlayerToSlot,
    removeSlot,
    registerNewPlayer,
    loadDbPlayers,
    loadAllSavedPlayers,
    generateTournament,
    updateGameScore,
    saveRound,
    loadHistory,
    loadGlobalRanking,
    roundHistoryFormOpen,
    setRoundHistoryFormOpen
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
