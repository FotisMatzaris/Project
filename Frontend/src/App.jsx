import { useEffect, useState } from 'react'
import { createField, deleteField, getFields, updateField } from './api'
import './App.css'

const EMPTY_FORM = { name: '', cropType: '', sizeInStremmata: '' }

function App() {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    getFields()
      .then((data) => {
        if (!cancelled) setFields(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const totalStremmata = fields.reduce((sum, f) => sum + f.sizeInStremmata, 0)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const payload = {
      name: form.name.trim(),
      cropType: form.cropType.trim(),
      sizeInStremmata: Number(String(form.sizeInStremmata).replace(',', '.')),
    }

    if (!payload.name || !payload.cropType) {
      setError('Συμπλήρωσε όνομα και τύπο καλλιέργειας.')
      return
    }
    if (!Number.isFinite(payload.sizeInStremmata) || payload.sizeInStremmata <= 0) {
      setError('Τα στρέμματα πρέπει να είναι αριθμός μεγαλύτερος από 0.')
      return
    }

    setSaving(true)
    try {
      if (editingId === null) {
        const created = await createField(payload)
        setFields((prev) => [...prev, created])
      } else {
        const updated = await updateField(editingId, payload)
        setFields((prev) => prev.map((f) => (f.id === editingId ? updated : f)))
      }
      resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(field) {
    setError('')
    setEditingId(field.id)
    setForm({
      name: field.name,
      cropType: field.cropType,
      sizeInStremmata: String(field.sizeInStremmata),
    })
  }

  async function handleDelete(field) {
    if (!window.confirm(`Διαγραφή του χωραφιού «${field.name}»;`)) return
    setError('')
    try {
      await deleteField(field.id)
      setFields((prev) => prev.filter((f) => f.id !== field.id))
      if (editingId === field.id) resetForm()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="container">
      <h1>Τα χωράφια μου</h1>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <form className="card form" onSubmit={handleSubmit}>
        <h2>{editingId === null ? 'Νέο χωράφι' : 'Επεξεργασία χωραφιού'}</h2>

        <label>
          Όνομα / τοποθεσία
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            maxLength={100}
            placeholder="π.χ. Χωράφι Νάουσα"
          />
        </label>

        <label>
          Καλλιέργεια
          <input
            name="cropType"
            value={form.cropType}
            onChange={handleChange}
            maxLength={100}
            placeholder="π.χ. Ροδάκινα"
          />
        </label>

        <label>
          Στρέμματα
          <input
            name="sizeInStremmata"
            type="number"
            min="0"
            step="any"
            value={form.sizeInStremmata}
            onChange={handleChange}
            placeholder="π.χ. 12.5"
          />
        </label>

        <div className="actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Αποθήκευση…' : editingId === null ? 'Προσθήκη' : 'Αποθήκευση αλλαγών'}
          </button>
          {editingId !== null && (
            <button type="button" className="secondary" onClick={resetForm}>
              Ακύρωση
            </button>
          )}
        </div>
      </form>

      <section className="card">
        <h2>
          Λίστα χωραφιών
          {fields.length > 0 && (
            <span className="muted">
              {' '}
              — {fields.length} χωράφια, {totalStremmata.toLocaleString('el-GR')} στρέμματα
            </span>
          )}
        </h2>

        {loading ? (
          <p>Φόρτωση…</p>
        ) : fields.length === 0 ? (
          <p className="muted">Δεν έχεις προσθέσει ακόμα κανένα χωράφι.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Όνομα</th>
                <th>Καλλιέργεια</th>
                <th className="num">Στρέμματα</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {fields.map((f) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{f.cropType}</td>
                  <td className="num">{f.sizeInStremmata.toLocaleString('el-GR')}</td>
                  <td className="row-actions">
                    <button type="button" className="secondary" onClick={() => handleEdit(f)}>
                      Επεξεργασία
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(f)}>
                      Διαγραφή
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}

export default App
