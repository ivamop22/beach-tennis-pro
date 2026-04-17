# Arena GWM · Beach Tennis (React + Vite)

Projeto convertido do `index.html` original para React com estrutura pronta para deploy.

## Tecnologias
- React 18
- Vite
- Supabase
- GitHub Pages

## Como rodar
```bash
npm install
cp .env.example .env
npm run dev
```

## Variáveis de ambiente
Preencha o arquivo `.env`:
```env
VITE_SUPABASE_URL=https://mxjnydrllpxqwmfwzlsr.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

## Build
```bash
npm run build
npm run preview
```

## Deploy no GitHub Pages
Este projeto já está com `base: '/beach-tennis-pro/'` no `vite.config.js`.

### Passos
1. Suba os arquivos para o repositório `beach-tennis-pro`
2. Rode:
```bash
npm install
npm run build
npm run deploy
```
3. No GitHub, confirme que o Pages usa a branch criada pelo `gh-pages`

## Estrutura
- `src/contexts/AppContext.jsx`: estado global do app
- `src/utils/tournament.js`: motor de geração do torneio
- `src/pages/*`: páginas principais
- `src/components/*`: UI reaproveitável

## Funcionalidades convertidas
- Login/cadastro com Supabase
- Configuração de torneio
- Seleção e cadastro de jogadores
- Geração de chaveamento
- Controle de placar
- Timer do torneio
- Estatísticas
- Ranking atual e ranking global
- Histórico de rodadas
