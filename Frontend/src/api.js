const FIELDS = '/api/fields'
const AUTH = '/api/auth'

// Τι θα γίνει όταν λήξει η σύνδεση όσο ο χρήστης είναι μέσα. Το ορίζει το AuthGate.
let onUnauthorized = () => {}
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

async function request(url, options) {
  let response
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new Error('Δεν είναι δυνατή η σύνδεση με τον διακομιστή. Τρέχει το backend;')
  }

  if (response.status === 204) return null

  let data = null
  try {
    data = await response.json()
  } catch {
    // κενό ή μη-JSON σώμα
  }

  if (!response.ok) {
    const error = new Error(messageFor(response.status, data))
    error.status = response.status
    error.fields = data?.errors ?? {}
    if (response.status === 401 && !url.startsWith(AUTH)) onUnauthorized()
    throw error
  }
  return data
}

function messageFor(status, data) {
  if (data?.errors) return Object.values(data.errors).flat().join(' ')
  if (status === 401) return 'Η σύνδεσή σου έληξε. Συνδέσου ξανά.'
  if (status === 429) return 'Πολλές προσπάθειες. Περίμενε ένα λεπτό και δοκίμασε ξανά.'
  if (status >= 500) return 'Ο διακομιστής δεν απαντά. Τρέχει το backend;'
  return `Το αίτημα απέτυχε (${status}).`
}

const post = (url, body) =>
  request(url, { method: 'POST', body: body && JSON.stringify(body) })

// Λογαριασμοί
export async function getMe() {
  try {
    return await request(`${AUTH}/me`)
  } catch (e) {
    if (e.status === 401) return null // απλώς δεν έχει συνδεθεί
    throw e
  }
}
export const checkEmail = (email) => post(`${AUTH}/check`, { email })
export const register = (input) => post(`${AUTH}/register`, input)
export const login = (input) => post(`${AUTH}/login`, input)
export const logout = () => post(`${AUTH}/logout`)

// Χωράφια
export const getFields = () => request(FIELDS)
export const createField = (field) => post(FIELDS, field)
export const updateField = (id, field) =>
  request(`${FIELDS}/${id}`, { method: 'PUT', body: JSON.stringify(field) })
export const deleteField = (id) => request(`${FIELDS}/${id}`, { method: 'DELETE' })