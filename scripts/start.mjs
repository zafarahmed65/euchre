/**
 * Container entrypoint.
 *
 * Seeds the database if it is empty, then starts Next. The seed is idempotent —
 * it skips every record that already exists — so a restart is harmless, and a
 * seed failure is logged rather than preventing the site from coming up.
 */
import { spawn } from 'node:child_process'

const run = (cmd, args) =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: 'inherit', env: process.env })
    child.on('exit', (code) => resolve(code ?? 1))
  })

const seedExit = await run('npx', ['payload', 'run', 'src/seed/seed.ts'])
if (seedExit !== 0) {
  console.warn(`[start] seed exited with ${seedExit} — continuing to boot the server.`)
}

const serverExit = await run('npx', ['next', 'start', '--port', process.env.PORT || '3000'])
process.exit(serverExit)
