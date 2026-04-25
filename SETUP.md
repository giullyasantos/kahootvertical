# Setup Rápido - Ministry Game

## 🚀 Passos para Começar

### 1. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Preencha:
   - **Project name**: ministry-game (ou qualquer nome)
   - **Database Password**: (escolha uma senha forte)
   - **Region**: escolha a região mais próxima
4. Aguarde o projeto ser criado (~2 minutos)

### 2. Executar o Schema do Banco

1. No dashboard do Supabase, clique em **SQL Editor** (ícone de código no menu lateral)
2. Clique em **New query**
3. Copie TODO o conteúdo do arquivo `supabase/migrations/001_initial_schema.sql`
4. Cole no editor SQL
5. Clique em **RUN** (ou pressione Ctrl/Cmd + Enter)
6. Você deve ver a mensagem "Success. No rows returned"

### 3. Copiar as Credenciais

1. No dashboard do Supabase, clique em **Settings** (ícone de engrenagem) → **API**
2. Copie os seguintes valores:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** key (chave longa começando com `eyJ...`)

### 4. Configurar o Projeto

1. Na pasta do projeto, crie o arquivo `.env.local`:

```bash
cp .env.local.example .env.local
```

2. Abra o arquivo `.env.local` e cole suas credenciais:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 5. Instalar e Rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) 🎉

## 🎮 Testando o Jogo

### Teste Completo (2 dispositivos)

1. **No computador (Host)**:
   - Acesse `http://localhost:3000`
   - Clique em "Entrar como Host"
   - Clique em "Criar Nova Sala"
   - Anote o código de 4 dígitos

2. **No celular (Jogador)**:
   - Conecte o celular na mesma rede WiFi
   - Descubra o IP do seu computador:
     - Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
     - Windows: `ipconfig` (procure IPv4)
   - Acesse `http://SEU_IP:3000` no navegador do celular
   - Clique em "Entrar como Jogador"
   - Digite o código e seu nome

3. **Iniciar o jogo**:
   - No computador, clique em "Iniciar Jogo"
   - Responda as perguntas no celular!

### Teste Rápido (mesmo dispositivo)

1. Abra `http://localhost:3000` em uma aba
2. Clique em "Entrar como Host" → "Criar Nova Sala"
3. Abra uma **nova aba anônima/privada**
4. Acesse `http://localhost:3000` nessa aba
5. Clique em "Entrar como Jogador" e use o código

## ⚠️ Troubleshooting

### Erro: "Failed to fetch room"
- Verifique se o `.env.local` está configurado corretamente
- Verifique se você executou o SQL no Supabase
- Verifique se a URL do Supabase está correta (com https://)

### Erro: "Players not updating"
- Verifique se o Realtime está habilitado no Supabase
- No SQL Editor, execute novamente as linhas que começam com `ALTER PUBLICATION`

### Build Error
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📝 Próximos Passos

- [ ] Adicione mais perguntas em `lib/questions.ts`
- [ ] Customize as cores em `components/AnswerButton.tsx`
- [ ] Faça deploy na Vercel (veja README.md)

## 🆘 Suporte

Problemas? Abra uma issue no repositório ou entre em contato!
