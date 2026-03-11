# Fishionaire Events

A full-stack application built with **Nuxt 3**, combining a Vue.js frontend with a Nitro-powered backend API.

## Commands

- `npm run dev` — Start development server (http://localhost:3000)
- `npm run build` — Production build
- `npm run preview` — Preview production build locally

## Architecture

### Frontend — Atomic Design

Components follow the [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/) methodology. All component directories are auto-imported by Nuxt.

```
components/
  atoms/        → Smallest UI building blocks (headings, text, buttons, inputs)
  molecules/    → Combinations of atoms (cards, form groups)
  organisms/    → Complex UI sections composed of molecules/atoms (hero sections, navbars)
  templates/    → Page-level layout wrappers that define content structure
```

Pages live in `pages/` and use Nuxt's file-based routing.

### Backend — Layered Server Architecture

The server follows a strict layered pattern. Each layer has a single responsibility.

```
server/
  api/            → Route handlers (thin — delegate to controllers)
  controllers/    → Business logic (orchestrates repositories, returns data)
  repositories/   → Data access (fetches/saves data, returns/accepts entities)
  entities/       → Data models with fromJSON() and toJSON() methods
```

**Data flow:** `API route → Controller → Repository → Entity`

#### Rules

1. **Routes** (`server/api/`) are thin. They receive the request, call a controller method, and return the result. No business logic here.
2. **Controllers** (`server/controllers/`) contain all business logic. They call repositories to get/save data and coordinate between multiple repositories if needed.
3. **Entities** (`server/entities/`) are classes that abstract raw data. Every entity must have:
   - `static fromJSON(data)` — creates an instance from raw data (e.g. database row)
   - `toJSON()` — serializes the instance back to a plain object (e.g. for saving to DB or API response)
4. **Repositories** (`server/repositories/`) handle all database operations. They:
   - Accept IDs or query params, fetch data, and return **entities** (never raw data)
   - Accept **entities** and use `toJSON()` to persist data back to the database
5. **Never work with raw data objects** in controllers. Always use entities.

#### Example flow: GET /api/hello

1. `server/api/hello.get.js` receives the request, calls `HelloController.getGreeting()`
2. `HelloController` calls `GreetingRepository.getDefault()`
3. `GreetingRepository` fetches raw data, returns `Greeting.fromJSON(data)`
4. `HelloController` calls `greeting.toJSON()` and returns the result

## Code style

- Use Vue 3 `<script setup>` syntax in all components
- Use `defineProps()` for component props
- Use `useFetch()` for server data fetching in pages/components
- No semicolons, single quotes
- Keep components focused and small — prefer composition over inheritance
