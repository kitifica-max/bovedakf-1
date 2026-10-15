#!/bin/sh
# Dev server against the LOCAL Postgres in .env — never the Supabase URL in .env.local
# (Next loads .env.local over .env, so plain `npm run dev` would hit production data).
# Also blanks external services so local QA never sends real email, payments or Redis writes.
# Usage: npm run dev:local
set -e
cd "$(dirname "$0")/.."

env_value() { grep -E "^$1=" .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"'; }

DATABASE_URL="$(env_value DATABASE_URL)"
case "$DATABASE_URL" in
  *localhost*|*127.0.0.1*) ;;
  *) echo "DATABASE_URL en .env no es local; abortando para no tocar producción." >&2; exit 1 ;;
esac
export DATABASE_URL

# Comma-separated emails that see /admin locally (see src/lib/admin.ts).
export ADMIN_EMAILS="$(env_value ADMIN_EMAILS)"

export AUTH_URL=http://localhost:3000 NEXT_PUBLIC_APP_URL=http://localhost:3000
export RESEND_API_KEY= UPSTASH_REDIS_REST_URL= UPSTASH_REDIS_REST_TOKEN= WOMPI_APP_ID= WOMPI_CLIENT_SECRET=
export CRON_SECRET=local-cron-test

exec npx next dev
