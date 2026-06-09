# World CRUD

Aplicação fullstack para gerenciar continentes, países e cidades com autenticação JWT, dashboard protegido, CRUD completo e mapa mundi 3D com CesiumJS.

## Stack

Backend:
- Node.js, Express, TypeScript
- Prisma ORM, PostgreSQL
- JWT, bcrypt, Zod, dotenv, CORS
- Integrações REST Countries, GeoNames e OpenWeather/Open-Meteo

Frontend:
- React, Vite, TypeScript
- TailwindCSS, shadcn/ui, lucide-react
- React Router, TanStack Query, Axios
- CesiumJS para globo 3D

Infra:
- Docker Compose com PostgreSQL
- Prisma migrations e seed inicial

## Estrutura

```txt
world-crud/
  backend/
    prisma/
      migrations/
      schema.prisma
      seed.ts
    src/
      config/
      controllers/
      middlewares/
      prisma/
      repositories/
      routes/
      services/
      utils/
      validations/
  frontend/
    src/
      components/
      components/ui/
      context/
      hooks/
      lib/
      pages/
      routes/
      services/
      types/
  docker-compose.yml
  README.md
```

## Como rodar do zero

1. Suba o PostgreSQL:

```bash
cd world-crud
docker compose up -d
```

2. Configure o backend:

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

A API ficara em `http://localhost:3333/api`.

3. Configure o frontend em outro terminal:

```bash
cd world-crud/frontend
cp .env.example .env
npm install
npm run dev
```

O app ficara em `http://localhost:5173`.

## Variaveis de ambiente

`backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/world_crud"
JWT_SECRET="change_me"
JWT_EXPIRES_IN="7d"
PORT=3333
OPENWEATHER_API_KEY=""
GEONAMES_USERNAME=""
```

`frontend/.env`:

```env
VITE_API_URL="http://localhost:3333/api"
VITE_CESIUM_ACCESS_TOKEN=""
```

Chaves externas:
- `OPENWEATHER_API_KEY`: opcional. Se estiver vazia, o backend usa Open-Meteo para clima atual.
- `GEONAMES_USERNAME`: necessario apenas para `/api/external/cities/search`.
- `VITE_CESIUM_ACCESS_TOKEN`: opcional para uso com Cesium Ion. O mapa carrega com CesiumJS; recursos Ion privados precisam desse token.

Nunca coloque chaves de OpenWeather ou GeoNames no frontend. Chamadas com segredo passam pelo backend.

## Seed inicial

O seed cria:
- América do Sul, América do Norte, Europa, Ásia, África, Oceania e Antártida
- Brasil, Estados Unidos, França, Japão, Argentina e Alemanha
- Sao Paulo, Rio de Janeiro, Brasilia, New York, Los Angeles, Washington, Paris, Lyon, Tokyo, Osaka, Buenos Aires e Berlin

Rode:

```bash
cd backend
npm run prisma:seed
```

Tambem existem endpoints protegidos para seed:
- `POST /api/seed/continents`
- `POST /api/seed/countries`

## Autenticação

Fluxo:
1. Crie uma conta em `/register`.
2. Entre em `/login`.
3. O frontend salva o JWT em `localStorage`.
4. O Axios envia `Authorization: Bearer <token>` nos endpoints privados.
5. O backend valida o token no middleware `authMiddleware`.

## Principaís endpoints

Publicos:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/health`

Protegidos:
- `GET /api/auth/me`
- `GET /api/dashboard/stats`

Continentes:
- `POST /api/continents`
- `GET /api/continents`
- `GET /api/continents/:id`
- `PUT /api/continents/:id`
- `DELETE /api/continents/:id`

Países:
- `POST /api/countries`
- `GET /api/countries`
- `GET /api/countries/:id`
- `PUT /api/countries/:id`
- `DELETE /api/countries/:id`

Cidades:
- `POST /api/cities`
- `GET /api/cities`
- `GET /api/cities/:id`
- `PUT /api/cities/:id`
- `DELETE /api/cities/:id`

Clima e dados externos:
- `GET /api/weather/city/:cityId`
- `GET /api/external/countries`
- `GET /api/external/cities/search?q=Paris&countryCode=FR`
- `POST /api/seed/continents`
- `POST /api/seed/countries`

## Arquitetura

Backend:
- `routes`: define URLs e aplica validações.
- `controllers`: recebe request e response.
- `services`: concentra regras de negocio, validações de relacionamento e integrações externas.
- `repositories`: encapsula acesso Prisma.
- `middlewares`: JWT, validação Zod e tratamento global de erros.
- `config`: variaveis de ambiente e providers externos.

Frontend:
- `context/AuthContext`: sessão, login, cadastro e logout.
- `hooks`: React Query para CRUD, dashboard e clima.
- `services`: chamadas Axios para a API.
- `components`: layout, tabelas, modais, formularios, cards, mapa e painel lateral.
- `pages`: telas de login, cadastro, dashboard, CRUDs e mapa 3D.

## Mapa 3D

A página `/map`:
- Renderiza globo com CesiumJS.
- Mostra marcadores para cidades vindas do backend.
- Permite clicar em uma cidade.
- Abre painel lateral com cidade, país, continente, coordenadas, população, timezone e clima atual.
- Permite selecionar país ou cidade para aproximar a câmera.
- Possui botao de reset para a visao global.

## Scripts uteis

Na raiz:

```bash
npm run db:up
npm run db:down
npm run install:all
npm run dev:backend
npm run dev:frontend
```

Backend:

```bash
npm run dev
npm run build
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
```
