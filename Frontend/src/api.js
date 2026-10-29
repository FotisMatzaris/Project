const BASE = '/api/fields'

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
    if (data?.errors) {
      throw new Error(Object.values(data.errors).flat().join(' '))
    }
    throw new Error(`Το αίτημα απέτυχε (${response.status}).`)
  }
  return data
}

export const getFields = () => request(BASE)
export const createField = (field) =>
  request(BASE, { method: 'POST', body: JSON.stringify(field) })
export const updateField = (id, field) =>
  request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(field) })
export const deleteField = (id) => request(`${BASE}/${id}`, { method: 'DELETE' })
