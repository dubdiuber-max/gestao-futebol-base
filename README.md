# Gestão Futebol de Base

Aplicação web para organização de uma escolinha de futebol.

## Tecnologias
- React + Vite
- Firebase Authentication (e-mail/senha e Google)
- Cloud Firestore
- Vercel

## Executar localmente
1. Instale Node.js.
2. Execute `npm install`.
3. Copie `.env.example` para `.env.local` e preencha as variáveis do Firebase.
4. Execute `npm run dev`.

## Deploy
A Vercel deve usar `npm run build` e diretório de saída `dist`. Configure as variáveis `VITE_FIREBASE_*` no projeto Vercel.

## Segurança
As regras em `firestore.rules` são apenas um ponto de partida. Antes de cadastrar dados reais de atletas menores, implemente autorização por perfil/academia e regras por documento. Não publique dados pessoais sem consentimento dos responsáveis.

## Estado atual
MVP inicial: autenticação, painel, cadastro/listagem/exclusão de atletas e telas preparadas para mensalidades, competições e convocações. Pagamentos e notificações automáticas ainda não estão implementados.