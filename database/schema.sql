-- ============================================================
-- BEACH TENNIS PRO - Schema Supabase v2 (CORRIGIDO)
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: profiles (usuários)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê próprio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuário atualiza próprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuário insere próprio perfil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger para criar perfil automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABELA: players (jogadores salvos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  sobrenome TEXT DEFAULT '',
  idade INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, nome, sobrenome)
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia próprios jogadores" ON public.players
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TABELA: rounds (rodadas de torneio)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rounds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Rodada',
  player_count INTEGER NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia próprias rodadas" ON public.rounds
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TABELA: round_games (partidas de uma rodada)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.round_games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  round_id UUID REFERENCES public.rounds(id) ON DELETE CASCADE NOT NULL,
  game_number INTEGER NOT NULL,
  team1_player1 INTEGER NOT NULL,
  team1_player2 INTEGER NOT NULL,
  team2_player1 INTEGER NOT NULL,
  team2_player2 INTEGER NOT NULL,
  score1 INTEGER DEFAULT 0,
  score2 INTEGER DEFAULT 0,
  status TEXT DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'andamento', 'concluido'))
);

ALTER TABLE public.round_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia partidas de suas rodadas" ON public.round_games
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.rounds r
      WHERE r.id = round_id AND r.user_id = auth.uid()
    )
  );

-- ============================================================
-- TABELA: round_players (jogadores de uma rodada)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.round_players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  round_id UUID REFERENCES public.rounds(id) ON DELETE CASCADE NOT NULL,
  player_index INTEGER NOT NULL,
  nome TEXT NOT NULL,
  sobrenome TEXT DEFAULT '',
  idade INTEGER,
  jogos INTEGER DEFAULT 0,
  vitorias INTEGER DEFAULT 0,
  games_pro INTEGER DEFAULT 0,
  games_contra INTEGER DEFAULT 0
);

ALTER TABLE public.round_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê jogadores de suas rodadas" ON public.round_players
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.rounds r
      WHERE r.id = round_id AND r.user_id = auth.uid()
    )
  );

-- ============================================================
-- VIEW: ranking_global (JOIN correto com rounds para user_id)
-- ============================================================
CREATE OR REPLACE VIEW public.ranking_global AS
SELECT
  r.user_id,
  LOWER(TRIM(p.nome || ' ' || COALESCE(p.sobrenome, ''))) AS player_key,
  MAX(p.nome)          AS nome,
  MAX(p.sobrenome)     AS sobrenome,
  SUM(p.jogos)         AS total_jogos,
  SUM(p.vitorias)      AS total_vitorias,
  SUM(p.games_pro)     AS total_games_pro,
  SUM(p.games_contra)  AS total_games_contra,
  SUM(p.games_pro) - SUM(p.games_contra) AS saldo_games,
  CASE
    WHEN SUM(p.games_pro) + SUM(p.games_contra) > 0
    THEN ROUND(
      SUM(p.games_pro)::NUMERIC /
      (SUM(p.games_pro) + SUM(p.games_contra)),
      3
    )
    ELSE 0
  END AS game_average,
  COUNT(DISTINCT p.round_id) AS rodadas_jogadas
FROM public.round_players p
JOIN public.rounds r ON r.id = p.round_id
GROUP BY
  r.user_id,
  LOWER(TRIM(p.nome || ' ' || COALESCE(p.sobrenome, '')));

-- ============================================================
-- INDEXES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_players_user_id      ON public.players(user_id);
CREATE INDEX IF NOT EXISTS idx_rounds_user_id        ON public.rounds(user_id);
CREATE INDEX IF NOT EXISTS idx_rounds_created_at     ON public.rounds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_round_games_round_id  ON public.round_games(round_id);
CREATE INDEX IF NOT EXISTS idx_round_players_round_id ON public.round_players(round_id);

-- ============================================================
-- FUNÇÃO: save_round (salvar rodada completa em 1 chamada)
-- ============================================================
CREATE OR REPLACE FUNCTION public.save_round(
  p_user_id     UUID,
  p_name        TEXT,
  p_player_count INTEGER,
  p_duration    INTEGER,
  p_players     JSONB,
  p_games       JSONB
)
RETURNS UUID AS $$
DECLARE
  v_round_id UUID;
  v_player   JSONB;
  v_game     JSONB;
BEGIN
  -- Inserir rodada
  INSERT INTO public.rounds (user_id, name, player_count, duration_seconds)
  VALUES (p_user_id, p_name, p_player_count, p_duration)
  RETURNING id INTO v_round_id;

  -- Inserir jogadores
  FOR v_player IN SELECT * FROM jsonb_array_elements(p_players)
  LOOP
    INSERT INTO public.round_players (
      round_id, player_index, nome, sobrenome, idade,
      jogos, vitorias, games_pro, games_contra
    ) VALUES (
      v_round_id,
      (v_player->>'player_index')::INTEGER,
      v_player->>'nome',
      COALESCE(v_player->>'sobrenome', ''),
      NULLIF(v_player->>'idade', '')::INTEGER,
      COALESCE((v_player->>'jogos')::INTEGER, 0),
      COALESCE((v_player->>'vitorias')::INTEGER, 0),
      COALESCE((v_player->>'games_pro')::INTEGER, 0),
      COALESCE((v_player->>'games_contra')::INTEGER, 0)
    );
  END LOOP;

  -- Inserir partidas
  FOR v_game IN SELECT * FROM jsonb_array_elements(p_games)
  LOOP
    INSERT INTO public.round_games (
      round_id, game_number,
      team1_player1, team1_player2,
      team2_player1, team2_player2,
      score1, score2, status
    ) VALUES (
      v_round_id,
      (v_game->>'game_number')::INTEGER,
      (v_game->>'t1p1')::INTEGER,
      (v_game->>'t1p2')::INTEGER,
      (v_game->>'t2p1')::INTEGER,
      (v_game->>'t2p2')::INTEGER,
      COALESCE((v_game->>'score1')::INTEGER, 0),
      COALESCE((v_game->>'score2')::INTEGER, 0),
      COALESCE(v_game->>'status', 'aguardando')
    );
  END LOOP;

  RETURN v_round_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
SELECT 'Schema v2 criado com sucesso!' AS resultado;
-- ============================================================
