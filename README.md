# Bookshelf

Aplicação web para organizar uma estante pessoal e acompanhar o progresso das leituras. Cada usuário possui uma conta e gerencia seus próprios livros, classificados como **Lidos**, **Lendo** ou **Próximas Leituras**.

Projeto desenvolvido para estudo e prática de programação full stack, integrando uma interface React a uma API REST com autenticação e persistência em MySQL.

## Funcionalidades

- Cadastro e login de usuários.
- Saudação personalizada com o nome do usuário logado.
- Cadastro de livros com título e autor.
- Edição e exclusão de livros, com confirmação antes de excluir.
- Alteração do status de leitura.
- Filtros por status, com contagem de livros. Clicar novamente no filtro ativo exibe toda a estante.
- Estante individual, vinculada ao usuário autenticado.
- Mensagens de carregamento e erro, com opção de atualizar a lista.
- Logout e retorno ao login quando a API identifica um token inválido ou expirado.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, TypeScript, Vite e CSS Modules |
| Backend | Node.js, Express 5 e TypeScript |
| Banco de dados | MySQL 8 e mysql2 |
| Autenticação | JSON Web Token e bcrypt |
| Controle de requisições | express-rate-limit |
| Desenvolvimento | Docker Compose, tsx e ESLint |
| Testes | Test runner nativo do Node.js |

## Estrutura

```text
bookshelf/
├── backend/
│   ├── src/
│   │   ├── config/          # Variáveis de ambiente
│   │   ├── controllers/     # Regras das requisições
│   │   ├── database/        # Conexão com o MySQL
│   │   ├── middlewares/     # Autenticação, autorização e limites
│   │   ├── routes/          # Rotas da API
│   │   ├── types/           # Tipagens do backend
│   │   └── server.ts
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/      # Formulário e cartão de livro
│   │   ├── hook/            # Estado e operações da estante
│   │   ├── pages/           # Login, cadastro e estante
│   │   ├── services/        # Comunicação com a API
│   │   └── types/           # Tipagens do frontend
│   └── tests/
└── docker-compose.yml      # MySQL para desenvolvimento local
```

## Executando localmente

### Pré-requisitos

- Node.js 22.12 ou superior e npm.
- Docker com Docker Compose, ou uma instalação do MySQL 8.
- Um cliente MySQL para executar o SQL de criação das tabelas.

Baixe ou clone o repositório e abra um terminal na raiz do projeto. Os comandos de cópia abaixo usam PowerShell.

### 1. Configure as variáveis de ambiente

Copie os exemplos:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Edite `backend/.env` com os dados da sua instalação:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=usuario_local
DB_PASSWORD=preencha_localmente
DB_NAME=bookshelf
FRONTEND_URL=http://localhost:5173
JWT_SECRET=substitua_por_um_segredo_aleatorio
```

O usuário definido em `DB_USER` precisa existir no MySQL e ter permissão de acesso ao banco. O Docker Compose atual cria o banco e configura a conta root, mas não cria automaticamente `usuario_local`.

Para gerar um segredo JWT, execute e copie o resultado apenas para o arquivo local:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Em `frontend/.env`, configure o endereço da API:

```dotenv
VITE_API_URL=http://localhost:3000
```

Se mudar a porta do backend, ajuste também `VITE_API_URL`. O valor de `FRONTEND_URL` deve corresponder à origem usada para abrir o frontend.

### 2. Inicie o MySQL

Para usar o Docker Compose, crie também um arquivo `.env` **na raiz do projeto**:

```dotenv
MYSQL_ROOT_PASSWORD=defina_uma_senha_local
```

Na raiz, execute:

```powershell
docker compose up -d
```

O serviço disponibiliza o MySQL na porta `3306` e mantém os dados no volume `bookshelf_data`. Se já existir um banco nesse volume, alterar a variável de senha não modifica a senha existente.

O Compose atual publica a porta do MySQL no host. Use essa configuração apenas em um ambiente local controlado.

### 3. Crie as tabelas

O repositório não inclui um script de inicialização automática do esquema. Para uma instalação nova, o SQL abaixo é uma referência compatível com os campos utilizados pela aplicação. Execute-o no seu cliente MySQL:

```sql
CREATE DATABASE IF NOT EXISTS bookshelf
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bookshelf;

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE books (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  readed BOOLEAN NOT NULL DEFAULT FALSE,
  reading BOOLEAN NOT NULL DEFAULT FALSE,
  user_id INT NOT NULL,
  CONSTRAINT fk_books_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

Use esse exemplo somente em um banco novo. Em um banco existente, confira o esquema antes de fazer alterações. A coluna `password` armazena o hash gerado pelo backend, e não a senha em texto puro.

O status é representado pelos campos existentes na API:

| Status | `readed` | `reading` |
| --- | --- | --- |
| Próximas Leituras | `false` | `false` |
| Lendo | `false` | `true` |
| Lidos | `true` | `false` |

A API rejeita atualizações em que os dois campos são `true`. Novos livros entram em **Próximas Leituras**.

### 4. Inicie o backend

Em um terminal:

```powershell
cd backend
npm ci
npm run dev
```

Com a configuração sugerida, a API fica disponível em `http://localhost:3000`. A rota `GET /` retorna uma mensagem de funcionamento da API; ela não verifica a conexão com o banco.

### 5. Inicie o frontend

Em outro terminal, partindo da raiz:

```powershell
cd frontend
npm ci
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://localhost:5173`. Crie uma conta, faça login e adicione seu primeiro livro.

## API REST

As rotas protegidas recebem o token retornado pelo login:

```http
Authorization: Bearer <token>
```

| Método | Rota | Acesso | Finalidade |
| --- | --- | --- | --- |
| GET | `/` | Público | Verificar se a API responde |
| POST | `/users` | Público, com limite de requisições | Criar conta |
| POST | `/login` | Público, com limite de requisições | Autenticar e obter token |
| GET | `/users/me` | Autenticado | Consultar o próprio perfil |
| GET | `/users/:id` | Apenas a própria conta | Consultar perfil por ID |
| PUT | `/users/:id` | Apenas a própria conta | Alterar nome e e-mail |
| DELETE | `/users/:id` | Apenas a própria conta | Solicitar exclusão da conta |
| GET | `/books` | Autenticado | Listar os próprios livros |
| POST | `/books` | Autenticado | Adicionar livro |
| PUT | `/books/:id` | Apenas o proprietário | Editar livro e status |
| DELETE | `/books/:id` | Apenas o proprietário | Excluir livro |

Exemplo de corpo para cadastro de livro:

```json
{
  "title": "Dom Casmurro",
  "author": "Machado de Assis"
}
```

Exemplo de atualização para **Lendo**:

```json
{
  "title": "Dom Casmurro",
  "author": "Machado de Assis",
  "readed": false,
  "reading": true
}
```

As operações de perfil por ID estão disponíveis na API; a interface atual concentra-se no cadastro, login e gerenciamento de livros. No esquema SQL de referência, uma conta com livros vinculados precisa ter esses livros excluídos antes da exclusão da conta.

## Verificações e testes

No diretório `frontend`:

```powershell
npm run lint
npm run build
node --test tests/useBooks.test.mjs
```

No diretório `backend`, com o `.env` configurado:

```powershell
npx tsc --noEmit
node --import tsx --test tests/regressions.test.mjs
npm run build
```

Os testes verificam autorização de contas, respostas sem o campo de senha, validação de livros e comportamento de sucesso ou falha ao adicionar um livro. Usam respostas simuladas do banco e da API; não substituem testes completos pelo navegador com MySQL real.

## Build

Para compilar e iniciar o backend:

```powershell
cd backend
npm run build
npm start
```

Para gerar o frontend e conferir o resultado localmente:

```powershell
cd frontend
npm run build
npm run preview
```

O frontend gera os arquivos estáticos em `frontend/dist`; o backend compila para `backend/dist`. O comando `preview` serve para conferir o build localmente. Se acessar o frontend por outra porta durante essa conferência, ajuste `FRONTEND_URL` no backend.

## Autenticação e cuidados com configuração

- Senhas são armazenadas como hashes bcrypt.
- Os tokens JWT expiram em oito horas.
- O frontend armazena token e dados do usuário no `localStorage` e os remove no logout.
- As consultas de livros incluem o ID do usuário autenticado para restringir o acesso à própria estante.
- Login permite até 10 requisições por IP em 15 minutos; cadastro permite até 5 por IP em uma hora. Ao exceder o limite, a API retorna `429`.
- O CORS utiliza `FRONTEND_URL`. A autorização dos dados é feita nos middlewares e nas consultas, independentemente do CORS.
- Arquivos `.env` são ignorados pelo Git; os exemplos contêm apenas valores de referência.

Variáveis `VITE_*` usadas pelo frontend são públicas no build. Credenciais do banco e `JWT_SECRET` devem existir somente no ambiente do backend. Não publique tokens reais, arquivos de configuração com segredos nem dumps com dados pessoais.

Este projeto tem finalidade educacional. Para hospedagem pública, configure HTTPS, credenciais próprias de produção e acesso restrito ao banco. A conexão MySQL atual não configura TLS: serviços que exigem conexão segura precisam dessa adaptação antes do deploy. A configuração de proxy e os limites de requisição também devem ser revisados conforme a hospedagem.
