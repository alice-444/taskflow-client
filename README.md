# taskflow-client

Node.js client to test Supabase authentication and RLS behavior.

## Prerequisites

- Node.js 18+
- A Supabase project with `tasks` and `profiles` tables

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

## Run

Execute the RLS verification script:

```bash
npm run test:rls
```

This runs `test-rls.js`, which:

- queries `tasks` without auth
- signs in a user
- checks visible tasks
- attempts an unauthorized update to validate RLS protection