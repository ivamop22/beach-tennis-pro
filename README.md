# 🎾 BeachTennis Pro — Tournament Manager

Aplicativo web para gerenciamento de torneios de Beach Tennis com chaveamento automático, placar em tempo real e ranking histórico.

![BeachTennis Pro](https://img.shields.io/badge/Beach%20Tennis-Pro-1A9DC7?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHRleHQgeT0iMjAiIGZvbnQtc2l6ZT0iMjAiPvCfjq48L3RleHQ+PC9zdmc+)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

## 🌐 Demo ao vivo

> Publique via GitHub Pages e adicione o link aqui

---

## ✨ Funcionalidades

- 🔐 **Autenticação** — cadastro e login com e-mail/senha via Supabase Auth
- 👥 **Jogadores** — 6, 8, 9, 10, 11 ou 12 participantes
- 🎲 **Chaveamento automático** — algoritmo garante:
  - Cada jogador joga exatamente 4 partidas
  - Nenhuma dupla se repete
  - Adversários não se repetem (máximo possível)
  - Evita jogos consecutivos para o mesmo jogador
- ⏱️ **Timer** — controle de tempo do torneio (máx 120 min)
- 📊 **Estatísticas** — jogos, vitórias, games pró/contra, saldo, parceiros
- 🏆 **Ranking** — critérios: saldo → vitórias → games pró → idade
- 🌐 **Ranking Geral** — Game Average histórico entre todas as rodadas
- 💾 **Histórico** — todas as rodadas salvas no Supabase
- 📱 **Responsivo** — funciona no celular durante a pelada

---

## 🗄️ Banco de Dados (Supabase)

### Estrutura das Tabelas

```
profiles          → Perfis dos usuários
players           → Base de jogadores salvos
rounds            → Rodadas de torneio
round_games       → Partidas de cada rodada
round_players     → Estatísticas por jogador/rodada
ranking_global    → VIEW com Game Average histórico
```

### Instalação do Schema

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor → New Query**
3. Cole o conteúdo de `database/schema.sql`
4. Clique **Run ▶**

---

## 🚀 Instalação

### Opção 1 — GitHub Pages (gratuito)

1. Fork este repositório
2. Vá em **Settings → Pages**
3. Source: **Deploy from branch → main → / (root)**
4. Acesse: `https://SEU-USUARIO.github.io/beach-tennis-pro`

### Opção 2 — Local

```bash
git clone https://github.com/SEU-USUARIO/beach-tennis-pro.git
cd beach-tennis-pro
# Abra index.html no navegador
```

---

## ⚙️ Configuração

O app já está configurado com as credenciais do Supabase em `index.html`.

Para usar com seu próprio projeto Supabase, edite as linhas no topo do `<script>` em `index.html`:

```javascript
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_KEY = 'SUA_ANON_KEY';
```

---

## 📱 Regras do Torneio

| Parâmetro | Valor |
|---|---|
| Jogadores | 6, 8, 9, 10, 11 ou 12 |
| Formato | Duplas (2×2) |
| Partidas por jogador | 4 |
| Games por partida | 0 a 4 |
| Placares válidos | 4×0, 4×1, 4×2, 4×3 |
| Tempo estimado | 11–12 min/partida |
| Tempo máximo | 120 minutos |

---

## 🏆 Critérios de Ranking

**Rodada atual:**
1. Saldo de games (GP − GC)
2. Vitórias
3. Games pró
4. Idade (mais jovem desempata)

**Ranking geral:**
- **Game Average** = Games Ganhos ÷ Total de Games Jogados

---

## 🛠️ Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript puro
- **Backend:** [Supabase](https://supabase.com) (PostgreSQL + Auth + RLS)
- **Hospedagem:** GitHub Pages

---

## 📄 Licença

MIT © VenkoIT
