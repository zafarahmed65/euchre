/**
 * One-time schema preparation, run before Payload initialises.
 *
 * Switching the admin to username login adds a NOT NULL `username` column. On a
 * users table that already has rows, Drizzle's schema push raises a warning and
 * asks for confirmation — and in a container there is no TTY, so `prompts`
 * cancels and calls process.exit(0). The push would be skipped silently and the
 * deploy would look fine while the schema never changed.
 *
 * So: if the users table exists but has no `username` column, drop it. Payload
 * then creates it fresh with no warning, and the seed recreates both accounts
 * from SEED_* environment variables. The accounts hold no content — articles
 * store an author name as text, and votes are anonymous — so nothing is lost.
 *
 * Once the column exists this does nothing at all.
 */
const databaseURI = process.env.DATABASE_URI || ''

if (!databaseURI.startsWith('postgres')) {
  console.log('[prepare-db] not Postgres — nothing to do.')
  process.exit(0)
}

const { default: pg } = await import('pg')
const client = new pg.Client({ connectionString: databaseURI })

try {
  await client.connect()

  const { rows } = await client.query(`
    SELECT
      to_regclass('public.users') IS NOT NULL AS users_exists,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'username'
      ) AS has_username
  `)

  const { users_exists: usersExists, has_username: hasUsername } = rows[0]

  if (!usersExists) {
    console.log('[prepare-db] no users table yet — Payload will create it.')
  } else if (hasUsername) {
    console.log('[prepare-db] username column already present — nothing to do.')
  } else {
    console.log('[prepare-db] users table predates username login — dropping it so the push is clean.')
    await client.query('DROP TABLE IF EXISTS users_sessions CASCADE')
    await client.query('DROP TABLE IF EXISTS users CASCADE')
    // Preferences reference users and would dangle otherwise.
    await client.query('TRUNCATE TABLE payload_preferences CASCADE').catch(() => {})
    console.log('[prepare-db] done — the seed will recreate the accounts.')
  }
} catch (err) {
  console.warn(`[prepare-db] skipped: ${err.message}`)
} finally {
  await client.end().catch(() => {})
}
