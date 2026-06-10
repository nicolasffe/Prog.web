# GeoCRUD

Sistema web para gerenciar continentes, paises e cidades com CRUD completo, autenticacao, banco PostgreSQL, clima real e globo 3D interativo.

## Documentacao

**Documento de testes:** [docs/Testes_Nicolas_Ferreira.docx](docs/Testes_Nicolas_Ferreira.docx)

**Video de apresentacao:** adicionar link aqui

## Tecnologias

- Frontend: React, Vite, TypeScript, React Router, react-globe.gl
- Backend: Node.js, Express, TypeScript, Prisma
- Banco de dados: PostgreSQL
- Autenticacao: JWT e bcrypt
- APIs externas: OpenWeather ou Open-Meteo para clima

## Requisitos

- Node.js instalado
- npm instalado
- PostgreSQL local ou banco online

## Configuracao do Backend

Crie o arquivo `backend/.env` com:

```env
DATABASE_URL="postgresql://usuario:senha@host:porta/banco"
JWT_SECRET="sua_chave_secreta"
JWT_EXPIRES_IN="7d"
PORT=3333
OPENWEATHER_API_KEY=""
GEONAMES_USERNAME=""
```

`OPENWEATHER_API_KEY` e `GEONAMES_USERNAME` sao opcionais.

## Como Rodar

Instale as dependencias:

```bash
npm run install:all
```

Prepare o banco:

```bash
cd backend
npx prisma generate
npx prisma db push
npm run prisma:seed
```

Rode o backend:

```bash
npm run dev
```

Em outro terminal, rode o frontend:

```bash
cd frontend
npm run dev
```

Acesse:

```text
http://localhost:5173
```

API local:

```text
http://localhost:3333/api
```

## Scripts Uteis

Na raiz do projeto:

```bash
npm run dev:backend
npm run dev:frontend
npm run build:backend
npm run build:frontend
```

## Funcionalidades

- Cadastro e login de usuario
- Senhas protegidas com bcrypt
- CRUD de continentes, paises e cidades
- Exclusao em cascata de dados vinculados
- Validacao de populacao de cidade
- Upload de bandeira do pais
- Dashboard com indicadores
- Globo 3D com paises e temperaturas por cidade
- Consulta de clima real por coordenadas
- Deploy preparado para Vercel
