# Flux - Sistema de Gestão Financeira Inteligente

O **Flux** é uma aplicação completa de gestão financeira pessoal projetada para oferecer controle total de receitas, despesas e organização de categorias orçamentárias. O ecossistema é composto por um aplicativo mobile moderno integrado a uma API robusta com persistência em banco de dados relacional e isolamento seguro de dados por usuário.

Este projeto foi desenvolvido como requisito prático para a disciplina no curso de Ciência da Computação (IESB).

---

## 🚀 Arquitetura e Tecnologias

* **Frontend (Mobile):** React Native com Expo, focando em usabilidade e filtros dinâmicos.
* **Backend (API REST):** Node.js com Express, estruturado em arquitetura MVC.
* **Banco de Dados & ORM:** MySQL gerenciado pelo Prisma ORM, garantindo persistência e relacionamentos seguros.
* **Segurança:** Autenticação via JSON Web Tokens (JWT) bloqueando acesso a endpoints protegidos.
* **Validação:** Zod garantindo a integridade dos dados (Fail-fast pattern).

---

## 🛠️ Funcionalidades Implementadas

* **Autenticação e Controle de Acesso:** Telas de login e cadastro validadas, com saudação dinâmica para o usuário autenticado.
* **Gestão de Transações:** Criação, listagem, edição e exclusão (via toque longo no app) de receitas e despesas.
* **Categorias Personalizadas e Isoladas:** Usuários podem criar categorias customizadas que ficam visíveis *apenas* em suas respectivas contas, sem interferir no banco de outros usuários.
* **Travas de Segurança:** O backend impede a exclusão de categorias padrões (ex: Salário, Alimentação) com retorno `HTTP 400 Bad Request`.
* **Resumo e Gráficos:** Visualização dinâmica dos gastos com filtro funcional por Mês/Ano.

---

## 📦 Como Executar o Projeto

A partir da raiz do projeto, você precisará de terminais separados para rodar a API e o Aplicativo.

### 1. Configurando e Rodando o Backend (API)
Abra um terminal na raiz do projeto, acesse a pasta do backend e instale as dependências:
` ` `bash
cd backend
npm install
` ` `
*(Nota: remova os espaços entre as crases ao colar no seu terminal/projeto)*

Crie e configure o arquivo `.env` na pasta `backend` com a string de conexão do MySQL (`DATABASE_URL`) e sua chave secreta (`JWT_SECRET`). Em seguida, rode as migrações, popule o banco (seed) e inicie o servidor:
` ` `bash
npx prisma migrate dev
npx prisma db seed
npm run dev
` ` `

> **💡 Dica de Visualização (Banco de Dados):** Se quiser visualizar e interagir com as tabelas de forma gráfica, abra um novo terminal na raiz do projeto, acesse a pasta do backend e inicie o Prisma Studio:
> ` ` `bash
> cd backend
> npx prisma studio
> ` ` `

### 2. Configurando e Rodando o Frontend (Mobile)
Abra um **novo terminal** na raiz do projeto, acesse a pasta do frontend, instale as dependências e inicie o Expo limpando o cache:
` ` `bash
cd frontend
npm install
npx expo start -c
` ` `

---

## 🧪 Testes Automatizados (Postman)

A suíte completa de testes exigida para validação da API está disponível no arquivo `collection.json` localizado na pasta `/postman` na raiz do projeto. Ela cobre o fluxo completo: login, validação de token, manipulação de categorias (com testes de trava de segurança) e transações.

---
**Desenvolvido por:** Pedro Luiz Marra G. Braga -2312130181-