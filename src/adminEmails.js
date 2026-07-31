/** Correos con acceso de súper usuario (autorizar psicólogos). */
export const ADMIN_EMAILS = [
  'antonyayansi@gmail.com',
  'danielhachircana3@gmail.com'
]

export function isAdminEmail(email) {
  if (!email || typeof email !== 'string') return false
  return ADMIN_EMAILS.includes(email.trim().toLowerCase())
}
