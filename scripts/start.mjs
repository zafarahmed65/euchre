/**
 * Container entrypoint.
 *
 * Railway's Postgres is only reachable over the private network at runtime, so
 * the schema cannot be created during the build. This demo carries no migration
 * history either, which leaves one job for boot: make sure the schema exists,
 * seed anything missing, then start the server.
 *
 * @payloadcms/db-postgres only pushes a schema when NODE_ENV !== 'production'
 * (see connect.js), so the seed runs as a child process in development mode to
 * let Payload build the tables. Next itself still starts in production.
 *
 * The seed is idempotent — it skips every record that already exists — so
 * restarts are harmless, and a seed failure is logged rather than keeping the
 * site down.
 */
import { spawn } from 'node:child_process'

const run = (cmd, args, env) =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } })
    child.on('exit', (code) => resolve(code ?? 1))
  })

// Clears the one schema change that a non-interactive push cannot make safely.
await run('node', ['scripts/prepare-db.mjs'])

console.log('[start] syncing schema and seeding…')
const seedExit = await run('npx', ['payload', 'run', 'src/seed/seed.ts'], {
  NODE_ENV: 'development',
})

if (seedExit === 0) {
  console.log('[start] schema and seed complete.')
} else {
  console.warn(`[start] seed exited with ${seedExit} — continuing to boot the server.`)
}

console.log('[start] starting Next…')
const serverExit = await run('npx', ['next', 'start', '--port', process.env.PORT || '3000'], {
  NODE_ENV: 'production',
})
process.exit(serverExit)
