# This is a class project don't expect production-level code quality or security practices

# Also this uses a few stolen assets from Undertaile plz don't sue me 🙏

# Game API (Undertale-themed)

Simple API + demo frontend inspired by Undertale.

- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth: JWT
- Frontend: static

## What The API provides

- User registration/login
- Player creation and retrieval (per authenticated user)
- Public read-only monster catalog
- Game lifecycle endpoints (`create`, `attack`, `move`)
- Aggregate authenticated overview (`players + monsters`)

The frontend in `/public` is a demo client that consumes these endpoints.

## Project Structure

all of this lives in `project-root/` btw:

- `server.js`: app bootstrap, middleware, route mounting
- `routes/`: route definitions
- `controllers/`: request handling
- `services/`: game/business logic
- `repositories/`: DB access abstraction
- `models/`: Mongoose schemas
- `utils/`: helpers (`jwt`, `serializer`, `generateId`, etc.)
- `public/`: demo frontend

## To Start

From `project-root/`:

```bash
docker compose up --build
```

Services:

- API: `http://localhost:3000/api`
- Frontend: `http://localhost:8100`
- dbgate: `http://localhost:8081`

## Environment Variables

modify the example `.env`:

## Authentication

Protected endpoints require header:

```http
Authorization: Bearer <token>
```

Token comes from:

- `POST /api/auth/register`
- `POST /api/auth/login`

If missing/invalid, API returns `401`.

## API Reference

Base URL: `/api`

### Auth

- `POST /auth/register`
  - Body: `{ "username": "...", "email": "...", "password": "..." }`
  - Success: `{ token, user }`

- `POST /auth/login`
  - Body: `{ "username": "...", "password": "..." }`
  - Success: `{ token, user }`

### Monsters (Public, Read-only)

- `GET /monsters`
  - Success: `{ "count": number, "monsters": [...] }`

- `GET /monsters/:id`
  - Supports either custom `id` or Mongo `_id`-compatible values

### Players (Auth Required)

- `GET /players`
- `GET /players/me`
- `GET /players/:id`
- `POST /players`
  - Body: `{ "name": "..." }`

### Games (Auth Required)

- `POST /games`
  - Body: `{ "playerId": "..." }`
- `POST /games/:id/attack`
  - Body (optional): `{ "action": "fight|mercy", "timingScore": 0..1, "dodgeScore": 0..1 }`
- `POST /games/:id/move`

### Overview (Auth Required)

- `GET /overview`
  - Returns `{ players, monsters }`
