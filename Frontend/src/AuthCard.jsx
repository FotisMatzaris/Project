import { useState } from 'react'
import { checkEmail, login, register } from './api'

const MIN_PASSWORD = 8
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const TEXTS = {
  email: { title: 'Καλώς ήρθες!', button: 'Συνέχεια' },
  login: { title: 'Γράψε τον κωδικό σου', button: 'Σύνδεση' },
  signup: { title: 'Φτιάξε λογαριασμό', button: 'Δημιουργία λογαριασμού' },
}

// Ποια πεδία φαίνονται σε κάθε βήμα. Τα υπόλοιπα λάθη βγαίνουν στο γενικό μήνυμα.
const VISIBLE = {
  email: ['email'],
  login: ['password'],
  signup: ['fullName', 'password'],
}

function AuthCard({ notice, onSuccess }) {
  const [step, setStep] = useState('email') // email | login | signup
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [sharedComputer, setSharedComputer] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState(notice)
  const [busy, setBusy] = useState(false)

  const cleanEmail = email.trim()

  function goTo(next) {
    setStep(next)
    setPassword('')
    setShowPassword(false)
    setErrors({})
    setGeneralError('')
  }

  function validate() {
    const found = {}
    if (step === 'email' && !EMAIL_PATTERN.test(cleanEmail))
      found.email = 'Γράψε ένα έγκυρο email.'
    if (step === 'signup' && !fullName.trim())
      found.fullName = 'Γράψε το όνομά σου.'
    if (step === 'signup' && password.length < MIN_PASSWORD)
      found.password = `Ο κωδικός θέλει τουλάχιστον ${MIN_PASSWORD} χαρακτήρες.`
    if (step === 'login' && !password)
      found.password = 'Γράψε τον κωδικό σου.'
    return found
  }

  function showServerError(error) {
    const found = {}
    const rest = []
    for (const [key, messages] of Object.entries(error.fields ?? {})) {
      if (VISIBLE[step].includes(key)) found[key] = messages.join(' ')
      else rest.push(...messages)
    }
    setErrors(found)
    const nothingShown = Object.keys(found).length === 0 && rest.length === 0
    setGeneralError(nothingShown ? error.message : rest.join(' '))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (busy) return
    const found = validate()
    setErrors(found)
    setGeneralError('')
    if (Object.keys(found).length > 0) return

    setBusy(true)
    try {
      if (step === 'email') {
        const { exists } = await checkEmail(cleanEmail)
        goTo(exists ? 'login' : 'signup')
      } else if (step === 'login') {
        onSuccess(await login({ email: cleanEmail, password, sharedComputer }))
      } else {
        onSuccess(
          await register({ fullName: fullName.trim(), email: cleanEmail, password, sharedComputer }),
        )
      }
    } catch (error) {
      showServerError(error)
    } finally {
      setBusy(false)
    }
  }

  const fieldProps = (name) => ({
    id: name,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': `${name}-error`,
  })

  const errorText = (name) => (
    <p className="auth-error" id={`${name}-error`} role="alert">
      {errors[name]}
    </p>
  )

  return (
    <div className="auth">
      <main className="auth-card">
        <a className="auth-brand" href="/" aria-label="Agrilog, αρχική σελίδα">
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20v-7" />
              <path d="M12 14c0-3.3 2.7-6 6-6h1v1c0 3.3-2.7 6-6 6h-1Z" />
              <path d="M12 16c0-2.8-2.2-5-5-5H6v1c0 2.8 2.2 5 5 5h1Z" />
            </svg>
          </span>
          Agrilog
        </a>

        <h1>{TEXTS[step].title}</h1>
        <p className="auth-sub">
          {step === 'email' ? 'Κάνε σύνδεση ή εγγραφή με το email σου.' : cleanEmail}
        </p>

        {generalError && (
          <p className="auth-alert" role="alert">
            {generalError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {step === 'email' ? (
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                {...fieldProps('email')}
                type="email"
                autoComplete="username"
                maxLength={256}
                placeholder="onoma@example.gr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errorText('email')}
            </div>
          ) : (
            // Κρυφό, για να ξέρει ο password manager σε ποιο email ανήκει ο κωδικός.
            <input type="email" autoComplete="username" value={cleanEmail} readOnly hidden />
          )}

          {step === 'signup' && (
            <div className="auth-field">
              <label htmlFor="fullName">Όνομα</label>
              <input
                {...fieldProps('fullName')}
                autoComplete="name"
                autoFocus
                maxLength={100}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errorText('fullName')}
            </div>
          )}

          {step !== 'email' && (
            <div className="auth-field">
              <label htmlFor="password">Κωδικός</label>
              <div className="auth-password">
                <input
                  {...fieldProps('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={step === 'signup' ? 'new-password' : 'current-password'}
                  autoFocus={step === 'login'}
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Απόκρυψη' : 'Εμφάνιση'}
                </button>
              </div>
              {step === 'signup' && !errors.password && (
                <p className="auth-hint">Τουλάχιστον {MIN_PASSWORD} χαρακτήρες.</p>
              )}
              {errorText('password')}
            </div>
          )}

          <label className="auth-check">
            <input
              type="checkbox"
              checked={sharedComputer}
              onChange={(e) => setSharedComputer(e.target.checked)}
            />
            Βρίσκομαι σε κοινόχρηστο υπολογιστή
          </label>

          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? 'Περίμενε…' : TEXTS[step].button}
          </button>
        </form>

        {step !== 'email' && (
          <button type="button" className="auth-back" onClick={() => goTo('email')} disabled={busy}>
            Άλλαξε email
          </button>
        )}
      </main>
    </div>
  )
}

export default AuthCard