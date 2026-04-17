export const VALID_PLAYER_COUNTS = [6, 8, 9, 10, 11, 12];
export const MAX_TOURNAMENT_SECONDS = 7200;

export function createEmptyPlayers(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    code: `J${index + 1}`,
    nome: '',
    sobrenome: '',
    idade: '',
    dbId: null,
  }));
}

export function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pairKey(pair) {
  return pair[0] < pair[1] ? `${pair[0]}-${pair[1]}` : `${pair[1]}-${pair[0]}`;
}

export function trySchedule(playerCount) {
  const gamesPerPlayer = 4;
  const pairs = [];

  for (let i = 0; i < playerCount; i += 1) {
    for (let j = i + 1; j < playerCount; j += 1) {
      pairs.push([i + 1, j + 1]);
    }
  }

  const playCount = {};
  const usedPairs = new Set();
  const opponentCount = {};
  const lastGame = {};

  for (let i = 1; i <= playerCount; i += 1) {
    playCount[i] = 0;
    opponentCount[i] = {};
  }

  const scheduledGames = [];
  const shuffledPairs = shuffle(pairs);

  for (let gameIndex = 0; gameIndex < playerCount; gameIndex += 1) {
    const availableTeam1 = shuffledPairs
      .filter((pair) => !usedPairs.has(pairKey(pair)) && playCount[pair[0]] < gamesPerPlayer && playCount[pair[1]] < gamesPerPlayer)
      .sort(
        (a, b) =>
          Math.max(lastGame[a[0]] || 0, lastGame[a[1]] || 0) -
          Math.max(lastGame[b[0]] || 0, lastGame[b[1]] || 0),
      );

    if (!availableTeam1.length) return null;

    const team1 = availableTeam1[Math.floor(Math.random() * Math.min(3, availableTeam1.length))];
    const excluded = new Set(team1);

    const availableTeam2 = shuffledPairs
      .filter(
        (pair) =>
          !pair.some((playerId) => excluded.has(playerId)) &&
          !usedPairs.has(pairKey(pair)) &&
          playCount[pair[0]] < gamesPerPlayer &&
          playCount[pair[1]] < gamesPerPlayer,
      )
      .sort((a, b) => {
        const aOpponents =
          (opponentCount[team1[0]][a[0]] || 0) +
          (opponentCount[team1[0]][a[1]] || 0) +
          (opponentCount[team1[1]][a[0]] || 0) +
          (opponentCount[team1[1]][a[1]] || 0);
        const bOpponents =
          (opponentCount[team1[0]][b[0]] || 0) +
          (opponentCount[team1[0]][b[1]] || 0) +
          (opponentCount[team1[1]][b[0]] || 0) +
          (opponentCount[team1[1]][b[1]] || 0);
        return aOpponents - bOpponents;
      });

    if (!availableTeam2.length) return null;

    const team2 = availableTeam2[Math.floor(Math.random() * Math.min(3, availableTeam2.length))];
    usedPairs.add(pairKey(team1));
    usedPairs.add(pairKey(team2));

    [team1[0], team1[1], team2[0], team2[1]].forEach((playerId) => {
      playCount[playerId] += 1;
      lastGame[playerId] = gameIndex + 1;
    });

    [
      [team1[0], team1[1]],
      [team1[0], team2[0]],
      [team1[0], team2[1]],
      [team1[1], team2[0]],
      [team1[1], team2[1]],
      [team2[0], team2[1]],
    ].forEach(([a, b]) => {
      opponentCount[a][b] = (opponentCount[a][b] || 0) + 1;
      opponentCount[b][a] = (opponentCount[b][a] || 0) + 1;
    });

    scheduledGames.push([team1, team2]);
  }

  if (Object.values(playCount).some((count) => count !== gamesPerPlayer)) return null;
  return scheduledGames;
}

export function generateTournamentGames(playerCount) {
  let schedule = null;
  for (let attempt = 0; attempt < 8000 && !schedule; attempt += 1) {
    schedule = trySchedule(playerCount);
  }

  if (!schedule) return null;

  return schedule.map((teams, index) => ({
    id: index + 1,
    teams,
    score: [0, 0],
    status: 'aguardando',
  }));
}

export function getPlayerDisplayName(player) {
  if (!player) return '';
  return `${player.nome}${player.sobrenome ? ` ${player.sobrenome}` : ''}`.trim();
}

export function getPlayerShortName(player) {
  if (!player) return '';
  return `${player.nome}${player.sobrenome ? ` ${player.sobrenome.charAt(0)}.` : ''}`.trim();
}

export function statusLabel(status) {
  return {
    aguardando: 'Aguardando',
    andamento: 'Em andamento',
    concluido: 'Concluído',
  }[status] || status;
}

export function calculateStats(players, games) {
  return players.map((player) => {
    let jogos = 0;
    let vit = 0;
    let gp = 0;
    let gc = 0;
    const partners = new Set();

    games.forEach((game) => {
      const [team1, team2] = game.teams;
      const onTeam1 = team1.includes(player.id);
      const onTeam2 = team2.includes(player.id);

      if ((!onTeam1 && !onTeam2) || game.status === 'aguardando') return;

      jogos += 1;
      const myScore = onTeam1 ? game.score[0] : game.score[1];
      const oppScore = onTeam1 ? game.score[1] : game.score[0];
      gp += myScore;
      gc += oppScore;

      if (game.status === 'concluido' && myScore > oppScore) vit += 1;

      (onTeam1 ? team1 : team2)
        .filter((partnerId) => partnerId !== player.id)
        .forEach((partnerId) => {
          const partner = players.find((item) => item.id === partnerId);
          if (partner) partners.add(`${partner.code} ${partner.nome}`);
        });
    });

    return {
      ...player,
      nomeExibicao: getPlayerShortName(player),
      jogos,
      vit,
      gp,
      gc,
      saldo: gp - gc,
      partners: Array.from(partners),
    };
  });
}

export function sortCurrentRanking(stats) {
  return [...stats].sort((a, b) => {
    if (b.saldo !== a.saldo) return b.saldo - a.saldo;
    if (b.vit !== a.vit) return b.vit - a.vit;
    if (b.gp !== a.gp) return b.gp - a.gp;
    return (parseInt(a.idade, 10) || 99) - (parseInt(b.idade, 10) || 99);
  });
}
