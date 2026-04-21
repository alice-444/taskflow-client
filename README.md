# taskflow-client

TypeScript client toolkit for validating Supabase auth, RLS, CRUD flows, realtime updates, and integration scenarios.

## Prerequisites

- Node.js 18+
- A Supabase project configured for this app schema (`profiles`, `tasks`, `comments`)

## Setup

1. Install dependencies:

```bash
npm install
```

1. Configure environment variables in `.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

## Available scripts

- `npm run test:rls`: run auth/RLS validation scenario (`test-rls.ts`)
- `npm run watch`: run Alice realtime watcher (`alice-watch.ts`)
- `npm run bob`: run Bob action script to generate events (`bob-actions.ts`)
- `npm run integration`: run end-to-end integration flow (`integration.ts`)
- `npm run build`: run TypeScript type check (`tsc --noEmit`)
- `npm test`: run build + RLS test

## Typical workflow

1. Validate TypeScript:

```bash
npm run build
```

1. Validate RLS/auth:

```bash
npm run test:rls
```

1. Validate realtime interactions (in separate terminals):

```bash
npm run watch
npm run bob
```

1. Run full integration scenario:

```bash
npm run integration
```

## Project notes

- Core modules:
  - `client.ts`: Supabase client initialization
  - `auth.ts`: sign in/up/out helpers
  - `tasks.ts`: CRUD and comments operations
  - `realtime.ts`: realtime subscriptions and presence
  - `upload.ts`: UploadThing configuration
- Functional journal and validations are documented in `docs/Journal.md`.
