# Ministry Game

Quiz bíblico em tempo real inspirado no Kahoot. Um jogo para grupos de jovens e ministérios com interface para host (telão) e jogadores (celular).

## Funcionalidades

- 🎮 **Interface para Host**: Controle o jogo do telão
- 📱 **Interface para Jogadores**: Responda do celular
- ⚡ **Tempo Real**: Atualizações instantâneas via Supabase Realtime
- 🏆 **Sistema de Pontos**: Pontuação base + bônus de velocidade
- 📊 **Placar ao Vivo**: Ranking atualizado em tempo real
- 🎨 **Design Inspirado no Kahoot**: Botões coloridos e interface intuitiva

## Estrutura do Projeto

```
ministry-game/
├── app/
│   ├── page.tsx              # Landing page
│   ├── host/
│   │   ├── page.tsx          # Dashboard do host
│   │   ├── lobby/page.tsx    # Sala de espera (mostra código)
│   │   └── game/page.tsx     # Tela do jogo (telão)
│   ├── join/page.tsx         # Jogador entra com código
│   └── play/page.tsx         # Tela do jogo (jogador)
├── components/
│   ├── AnswerButton.tsx      # Botão colorido de resposta
│   ├── Timer.tsx             # Timer circular animado
│   ├── Scoreboard.tsx        # Placar
│   └── PlayerList.tsx        # Lista de jogadores
├── hooks/
│   ├── useRealtimeRoom.ts    # Hook para sala
│   ├── useRealtimePlayers.ts # Hook para jogadores
│   └── useRealtimeAnswers.ts # Hook para respostas
├── lib/
│   ├── supabase.ts           # Cliente Supabase
│   ├── questions.ts          # Perguntas do quiz
│   └── utils.ts              # Funções auxiliares
├── types/
│   └── index.ts              # TypeScript types
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # Schema do banco
```

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute a migration em `supabase/migrations/001_initial_schema.sql` no SQL Editor
3. Copie as credenciais do projeto

### 3. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
```

### 4. Rodar o projeto

```bash
npm run dev
```

Acesse em `http://localhost:3000`

## Como Usar

### Host (Telão)

1. Acesse a página inicial e clique em "Entrar como Host"
2. Clique em "Criar Nova Sala" → um código de 4 dígitos será gerado
3. Aguarde os jogadores entrarem (você verá a lista ao vivo)
4. Opcionalmente adicione +500 pontos manualmente a jogadores (para perguntas verbais)
5. Clique em "Iniciar Jogo"
6. O timer de 20 segundos começa automaticamente
7. Clique em "Revelar Resposta" para mostrar a resposta correta e estatísticas
8. Clique em "Mostrar Placar" para exibir o ranking
9. Clique em "Próxima Pergunta" para continuar

### Jogadores (Celular)

1. Acesse a página inicial e clique em "Entrar como Jogador"
2. Digite o código da sala e seu nome
3. Aguarde o host iniciar o jogo
4. Responda as perguntas tocando nos botões coloridos
5. Veja seu resultado após cada resposta
6. Acompanhe sua posição no ranking

## Sistema de Pontuação

- **Resposta Correta**: 1000 pontos base
- **Bônus de Velocidade**: até 500 pontos extras (quanto mais rápido, mais pontos)
- **Resposta Errada**: 0 pontos
- **Pontos Manuais**: Host pode adicionar +500 pontos a qualquer jogador

## Tecnologias

- **Next.js 16** - Framework React
- **Supabase** - Banco de dados PostgreSQL + Realtime
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Estilização
- **Vercel** - Deploy

## Deploy

### Vercel (Recomendado)

1. Push o código para GitHub
2. Importe o projeto no [Vercel](https://vercel.com)
3. Adicione as variáveis de ambiente
4. Deploy automático!

## Perguntas

As perguntas estão em `lib/questions.ts`. Edite este arquivo para adicionar/modificar perguntas.

Cada pergunta tem:
- `question`: O texto da pergunta
- `options`: Array com 4 opções de resposta
- `correct`: Índice da resposta correta (0-3)
- `explanation`: Explicação da resposta
- `verse`: Versículo bíblico relacionado

## Cores dos Botões

- 🔴 Vermelho: `#E21B3C`
- 🔵 Azul: `#1368CE`
- 🟡 Amarelo: `#D89E00`
- 🟢 Verde: `#26890C`

## Licença

MIT

---

# Application Content Documentation

## Home Screen (/)
- **Title**: MINISTRY GAME
- **Subtitle**: Quiz Bíblico em Tempo Real
- **Buttons**: 
  - Ser Host
  - Entrar no Jogo
- **Footer**: Para grupos de jovens e ministérios

---

## Host Dashboard (/host)
- **Title**: Dashboard
- **Subtitle**: Crie uma sala para começar
- **Button**: Criar Nova Sala
- **Loading State**: Criando...
- **Error Message**: Erro ao criar sala. Tente novamente.
- **Link**: ← Voltar

---

## Join Page (/join)

### Step 1: Enter Code
- **Title**: Entrar
- **Subtitle**: Código da sala + seu nome
- **Input Placeholders**:
  - XXXX (room code)
  - SEU NOME (player name)
- **Button**: Continuar
- **Loading State**: Entrando...
- **Error Messages**:
  - Sala não encontrada. Verifique o código.
  - Esta sala já iniciou o jogo.
  - Erro ao buscar sala. Tente novamente.
- **Link**: ← Voltar

### Step 2: Select Team
- **Title**: Escolha seu Time
- **Greeting**: OLÁ, [PLAYER NAME]!
- **Empty State**: Nenhum time criado ainda!
- **Buttons**:
  - Criar Time
  - + Criar Novo Time
  - Entrar → (on team cards)

### Team Creation Section
- **Title**: Criar Time
- **Labels**:
  - Nome do Time
  - Escolha um Emoji
- **Input Placeholder**: GUERREIROS DE DEUS
- **Buttons**:
  - Criar e Entrar
  - Cancelar
- **Loading State**: Criando...
- **Error Message**: Erro ao criar time. Tente novamente.

---

## Host Lobby (/host/lobby)
- **Title**: Sala de Espera
- **Label**: Código da Sala
- **Info**: Jogadores entram com este código
- **Team Stats**: [X] jogador / [X] jogadores
- **Empty State**: Aguardando jogadores...
- **Button States**:
  - Iniciar Jogo ([X]) (when ready)
  - Aguardando Times... (when no teams)
  - Aguardando Jogadores... (when no players)
  - Iniciando... (loading)
  - Cancelar
  - 🎯 Roleta (test button)

---

## Host Game Screen (/host/game)

### Header
- **Progress**: Pergunta [X] / [Total]
- **Timer**: [X] seg
- **Answer Count**: [X] / [Total] Responderam

### Question Phase
- **Button**: Revelar Resposta

### Reveal Phase
- **Labels**:
  - Explicação:
  - 📖 [Verse reference]
- **Answer Stats**: [X] resposta / [X] respostas
- **Button**: Mostrar Placar

### Scoreboard Phase
- **Title**: Placar (during game) / 🏆 Placar Final (finished)
- **Team Info**: [Score] pts
- **Buttons**:
  - Próxima Pergunta (during game)
  - 🎯 Roleta (after game)
  - Nova Sala (after game)

---

## Host Roulette Screen (/host/roulette)

### Name Roulette Phase
- **Title**: Vez do time: [Emoji] [Team Name]
- **Display**: ? (when not spinning) / [Player Name] (when spinning)
- **Button**: 🎯 Girar Roleta / 🎰 Girando...
- **Info**: [X] jogador restante / [X] jogadores restantes neste time

### Waiting for Difficulty Phase
- **Title**: Jogador Selecionado:
- **Display**: [Player Name]
- **Info**: Aguardando escolha de dificuldade no celular...

### Difficulty Revealed Phase
- **Title**: Dificuldade Escolhida:
- **Options**:
  - 🟢 FÁCIL
  - 🟡 MÉDIO
  - 🔴 DIFÍCIL

### Superpower Window Phase
- **Title**: Janela de Superpoderes
- **Timer**: [X]s
- **Superpowers**:
  - 🔵 Checar com Amigos
  - 🟡 Double Points
- **Status**: ATIVO (when activated)

### Question Revealed Phase
- **Banner**: ⚡ DOUBLE POINTS ATIVO (when active)
- **Title**: Pergunta:
- **Info**: O jogador deve responder verbalmente
- **Point Buttons**:
  - 0 pts
  - 500 pts / 1000 pts (if double points)
  - 1000 pts / 2000 pts (if double points)

### Final Results Phase
- **Title**: 🎉 Roleta Finalizada!
- **Team Display**: [Score] pts
- **Button**: Ver Resultado Final

---

## Player Game Screen (/play)

### Top Bar
- **Labels**:
  - Sala
  - Rank
- **Display**: [Room Code], [Player Name], [Score] pts, #[Rank]

### Waiting Phase
- **Icon**: ⏳
- **Title**: Aguardando...
- **Message**: O jogo começará em breve!

### Playing Phase
- **Progress**: Pergunta [X] / [Total]
- **Time Up Banner**: ⏰ Tempo Esgotado!
- **Answer Labels**: A, B, C, D

### Answered Phase
- **Icon**: ✓
- **Title**: Resposta Enviada!
- **Message**: Aguardando os outros...

### Result Phase
- **Correct**:
  - Icon: 🎉
  - Title: Correto!
  - Label: Pontos Ganhos
  - Display: +[Points]
- **Incorrect**:
  - Icon: ❌
  - Title: Incorreto
- **Score Display**:
  - Label: Sua Pontuação
  - Rank: #[X]º lugar

### Finished Phase
- **Winner**:
  - Title: Você Ganhou!
- **Loser**:
  - Title: Você Perdeu!
- **Labels**:
  - Pontuação Final
  - 🥇 Campeão!
  - 🥈 2º Lugar!
  - 🥉 3º Lugar!
  - [X]º lugar
- **Button**: Voltar ao Início

### Loading State
- **Message**: Carregando...

---

## Player Roulette Screen (/play-roulette)

### Header
- **Display**: [Player Name], [Score] pts

### Waiting Phase
- **Icon**: ⏳
- **Title**: Aguardando sua vez...

### Selected Phase
- **Icon**: 🎯
- **Title**: É A SUA VEZ! 🔥

### Spin Difficulty Phase
- **Title**: Escolha a Dificuldade
- **Display**:
  - 🟢 FÁCIL
  - 🟡 MÉDIO
  - 🔴 DIFÍCIL
- **Button**: 🎯 Girar / 🎰 Girando...

### Superpower Window Phase
- **Title**: Superpoderes
- **Timer**: [X]s
- **Superpower Options**:
  - 🔵 Checar com Amigos
  - 🟡 Double Points
- **Used Status**: Já usado

### Question Time Phase
- **Icon**: 🎤
- **Title**: Responda verbalmente!
- **Message**: O host vai pontuar sua resposta

### Finished Phase
- **Icon**: ✅
- **Title**: Você já jogou!
- **Message**: Aguarde os outros jogadores
- **Label**: Pontuação do Time
- **Display**: [Team Emoji], [Team Name], [Score] pts

### Loading State
- **Message**: Carregando...

---

## General UI Elements

### Loading States
- Carregando...
- Criando...
- Entrando...
- Iniciando...
- 🎰 Girando...

### Navigation Links
- ← Voltar
- Voltar ao Início
- Nova Sala

### Icons & Emojis Used
- ⏳ (waiting)
- ✓ (submitted)
- 🎉 (correct)
- ❌ (incorrect)
- ⏰ (time up)
- 🎯 (roulette/target)
- 🔥 (selected)
- 🎤 (speak)
- ✅ (finished)
- 🥇🥈🥉 (rankings)
- 👑 (captain)
- 🟢🟡🔴 (difficulty levels)
- 🔵 (friend lifeline)
- 🟡 (double points)
- ⚡ (active power)
- 🏆 (trophy/final)
- 📖 (verse reference)

---

## Error Messages
- Sala não encontrada. Verifique o código.
- Esta sala já iniciou o jogo.
- Erro ao buscar sala. Tente novamente.
- Erro ao criar sala. Tente novamente.
- Erro ao criar time. Tente novamente.
- Erro ao entrar no time. Tente novamente.

---

## Notes
- All text is in Brazilian Portuguese
- Game is designed for youth groups and ministries
- Real-time multiplayer Bible quiz game
- Supports team-based gameplay with superpowers
- Includes both multiple-choice questions and verbal roulette rounds
