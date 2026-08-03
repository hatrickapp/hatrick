const USERNAME_RE = /^[a-z0-9_]{3,20}$/

const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'api',
  'auth',
  'hatrick',
  'hatrick_admin',
  'moderator',
  'root',
  'support',
  'system',
])

const OFFENSIVE_WORDS = [
  'asshole',
  'bastard',
  'bitch',
  'cunt',
  'fuck',
  'fucker',
  'nazi',
  'nigger',
  'shit',
  'slut',
  'whore',
]

export function normalize_username(username: string): string {
  return username.trim().toLowerCase()
}

export function is_valid_username(username: string): boolean {
  const normalized = normalize_username(username)
  return (
    normalized === username.trim()
    && USERNAME_RE.test(normalized)
    && !RESERVED_USERNAMES.has(normalized)
    && !OFFENSIVE_WORDS.some((word) => normalized.includes(word))
  )
}

export function sanitize_username_input(username: string): string {
  return username.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
}
