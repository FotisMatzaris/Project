import { useEffect, useState } from 'react'
import { getMe, logout, setUnauthorizedHandler } from './api'
import App from './App.jsx'
import AuthCard from './AuthCard.jsx'
import './Auth.css'

// Αποφασίζει τι βλέπει ο χρήστης: την κάρτα σύνδεσης ή την εφαρμογή.
function AuthGate() {
  const [status, setStatus] = useState('loading') // loading | guest | user | error
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    setUnauthorizedHandler(() => {
      setUser(null)
      setMessage('Η σύνδεσή σου έληξε. Συνδέσου ξανά.')
      setStatus('guest')
    })

    getMe()
      .then((me) => {
        if (cancelled) return
        if (me) enter(me)
        else setStatus('guest')
      })
      .catch((e) => {
        if (cancelled) return
        setMessage(e.message)
        setStatus('error')
      })

    return () => {
      cancelled = true
      setUnauthorizedHandler(() => {})
    }
  }, [])

  function enter(me) {
    window.history.replaceState(null, '', '/app/') // φεύγει το ?auth=login
    setMessage('')
    setUser(me)
    setStatus('user')
  }

  async function handleLogout() {
    setMessage('')
    try {
      await logout()
      window.location.assign('/')
    } catch (e) {
      setMessage(e.message)
    }
  }

  if (status === 'loading') {
    return <p className="gate-message">Φόρτωση…</p>
  }

  if (status === 'error') {
    return (
      <div className="gate-message">
        <p role="alert">{message}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Δοκίμασε ξανά
        </button>
      </div>
    )
  }

  if (status === 'guest') {
    return <AuthCard notice={message} onSuccess={enter} />
  }

  return (
    <>
      <header className="topbar">
        <strong className="topbar-brand">Agrilog</strong>
        <span className="topbar-name">{user.fullName}</span>
        <button type="button" className="secondary" onClick={handleLogout}>
          Αποσύνδεση
        </button>
      </header>
      {message && (
        <p className="alert topbar-alert" role="alert">
          {message}
        </p>
      )}
      <App />
    </>
  )
}

export default AuthGate