# 📚 Bookshelf

O **Bookshelf** é uma aplicação web fullstack desenvolvida para gerenciamento de uma biblioteca pessoal. A plataforma permite que usuários criem suas contas, organizem seus livros e acompanhem o andamento de suas leituras de maneira simples e intuitiva.

O projeto foi desenvolvido com o objetivo de consolidar conhecimentos em **React, TypeScript, Node.js, Express e MySQL**, colocando em prática a integração entre frontend, backend e banco de dados, além de autenticação, segurança e publicação em produção.

### 🔗 Acesse o projeto

**[Bookshelf — Aplicação online](https://bookshelf-ten-gamma.vercel.app)**

## 🚀 Funcionalidades

- Cadastro de usuários e autenticação por e-mail e senha.
- Gerenciamento de sessões utilizando JWT.
- Cadastro de livros com título e autor.
- Listagem dos livros cadastrados pelo usuário.
- Edição e exclusão de livros.
- Controle do status de leitura: não iniciado, lendo e lido.
- Filtros para organizar os livros por status.
- Armazenamento persistente em banco de dados MySQL.
- Proteção de rotas e isolamento dos dados entre usuários.
- Interface responsiva.

## 🛠️ Tecnologias utilizadas

**Frontend**
- React
- TypeScript
- Vite
- CSS Modules
- Fetch API

**Backend**
- Node.js
- Express
- TypeScript
- JWT (JSON Web Token)
- bcrypt
- express-rate-limit

**Banco de dados**
- MySQL
- mysql2
- Docker e Docker Compose

**Versionamento e deploy**
- Git e GitHub
- Vercel — Frontend
- Render — Backend
- Aiven — MySQL em produção

## 🏗️ Arquitetura da aplicação

O Bookshelf utiliza uma arquitetura cliente-servidor, separando as responsabilidades entre frontend, API e banco de dados.

**React (Vercel) → API REST (Render) → MySQL (Aiven)**

O frontend realiza requisições HTTP à API desenvolvida em Node.js e Express. O backend é responsável pelas regras de negócio, autenticação, autorização e comunicação com o banco de dados.

As informações são armazenadas no MySQL, garantindo a persistência dos dados dos usuários e de seus livros.

## 🔐 Autenticação e segurança

Durante o desenvolvimento, foram implementadas medidas para proteger a aplicação e os dados dos usuários:

- Armazenamento de senhas utilizando hash com bcrypt.
- Autenticação por JWT com tempo de expiração.
- Middleware para validação dos tokens.
- Proteção dos endpoints que exigem autenticação.
- Autorização para impedir acesso a livros de outros usuários.
- Consultas SQL parametrizadas para reduzir riscos de SQL Injection.
- Rate limiting nas rotas de login e cadastro.
- Configuração de CORS para o frontend autorizado.
- Variáveis de ambiente para credenciais e segredos.
- Conexão TLS com o banco de produção.
- Usuário MySQL com permissões restritas ao banco da aplicação.

**Observação:** a versão atual armazena o JWT no `localStorage`. A adoção de cookies `HttpOnly` e melhorias no gerenciamento de sessões são possibilidades de evolução.

## 📁 Estrutura do projeto

```text
bookshelf/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── types/
│   │   └── server.ts
│   └── tests/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hook/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── tests/
├── database/
│   └── schema.sql
├── docker-compose.yml
└── README.md
```

## 💻 Executando localmente

**Pré-requisitos:** Node.js, npm, Docker e Docker Compose.

### 1. Clonar o repositório

```bash
git clone https://github.com/ricardohcoco/bookshelf.git
cd bookshelf
```

### 2. Configurar o banco de dados

Crie um arquivo `.env` na raiz para o Docker Compose, com a variável:

```env
MYSQL_ROOT_PASSWORD=sua_senha_local
```

Inicie o container MySQL:

```bash
docker compose up -d
```

Crie as tabelas do banco `bookshelf` utilizando o arquivo `database/schema.sql`, por meio de um cliente MySQL.

### 3. Configurar o backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` com base em `.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_local
DB_NAME=bookshelf
DB_SSL=false
FRONTEND_URL=http://localhost:5173
JWT_SECRET=seu_segredo_local
```

Inicie o servidor:

```bash
npm run dev
```

### 4. Configurar o frontend

Em outro terminal:

```bash
cd frontend
npm install
```

Crie um arquivo `.env`:

```env
VITE_API_URL=http://localhost:3000
```

Inicie a aplicação:

```bash
npm run dev
```

Acesse o endereço local informado pelo Vite.

## 🧪 Testes

O projeto possui testes automatizados para funcionalidades do frontend e regras de autenticação, autorização e validação do backend.

**Backend**

```bash
cd backend
node --import tsx --test tests/regressions.test.mjs
```

**Frontend**

```bash
cd frontend
node --test tests/useBooks.test.mjs
```

Também foram realizados testes manuais com Insomnia, incluindo validação de JWT, expiração de tokens, acesso não autorizado e isolamento de dados entre usuários.

## 📈 Aprendizados

O desenvolvimento do Bookshelf proporcionou a aplicação prática de conceitos como:

- Construção e consumo de APIs REST.
- Integração entre React, Express e MySQL.
- Operações CRUD e persistência de dados.
- Autenticação e autorização com JWT.
- Organização do backend em controllers, routes e middlewares.
- Configuração de variáveis de ambiente.
- Utilização do Docker no desenvolvimento.
- Testes automatizados e de integração.
- Configuração de serviços em nuvem e deploy fullstack.

O projeto foi especialmente importante para consolidar o processo completo de desenvolvimento de uma aplicação, desde a organização inicial do código até sua disponibilização em produção.

---

**Desenvolvido como projeto de estudos e consolidação de conhecimentos em desenvolvimento web fullstack.**