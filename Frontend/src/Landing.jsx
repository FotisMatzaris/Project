import './Landing.css'

const PATHS = {
  leaf: 'M12 21v-8M12 13c0-4 3-6 7-6 0 4-3 6-7 6zM12 16c0-3-2-5-6-5 0 3 2 5 6 5z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  down: 'M12 5v14M6 13l6 6 6-6',
  check: 'M5 12l5 5 9-10',
  plus: 'M12 5v14M5 12h14',
  wifiOff: 'M2 8.8a15 15 0 0 1 4-2.4M22 8.8a15 15 0 0 0-9-3.7M5 12.9a10 10 0 0 1 5-2.7M19 12.9a10 10 0 0 0-2.4-1.9M8.5 16.4a5 5 0 0 1 7 0M12 20h.01M2 2l20 20',
  download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
}

function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}

const KPIS = [
  { cls: 'dark', label: 'Καθαρό υπόλοιπο', value: '4.055 €', note: 'Προηγούμενος μήνας: 1.500 €' },
  { cls: '', label: 'Έσοδα', value: '5.116 €', note: '4 κινήσεις' },
  { cls: 'red', label: 'Έξοδα', value: '1.061 €', note: '6 κινήσεις' },
]

const RECENT = [
  { title: 'Πώληση ελαιολάδου', sub: 'Ελιές Αγ. Παρασκευής', amount: '+1.480,00 €', pos: true },
  { title: 'Πετρέλαιο κίνησης', sub: 'Ελιές Αγ. Παρασκευής', amount: '−86,40 €', pos: false },
  { title: 'Συγκομιδή ελιάς', sub: '480 kg · 23 Οκτ', amount: '+936,00 €', pos: true },
]

const FEATURES = [
  { icon: 'plus', title: '3 κλικ ανά κίνηση', text: 'Από την τσέπη στο τεφτέρι.' },
  { icon: 'wifiOff', title: 'Χωρίς σήμα', text: 'Οι κινήσεις μένουν στη συσκευή.' },
  { icon: 'download', title: 'Έτοιμο για τον λογιστή', text: 'Καθαρή εξαγωγή CSV.' },
]

function scrollToId(e, id) {
  e.preventDefault()
  if (!id) window.scrollTo({ top: 0, behavior: 'smooth' })
  else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function Landing() {
  return (
    <div className="lp">
      <header className="lp-header">
        <a className="lp-logo" href="#" onClick={(e) => scrollToId(e, null)}>
          <span className="lp-logo-mark">
            <Icon name="leaf" />
          </span>
          Agrilog
        </a>
        <nav className="lp-nav" aria-label="Κύριο μενού">
          <a className="is-active" href="#" onClick={(e) => scrollToId(e, null)}>
            Αρχική
          </a>
          <a href="#" onClick={(e) => scrollToId(e, 'features')}>
            Υπηρεσίες
          </a>
        </nav>
        <a className="lp-signin" href="#/">
          Σύνδεση <Icon name="arrow" size={16} />
        </a>
      </header>

      <section className="lp-hero">
        <div>
          <p className="lp-eyebrow">
            <span className="lp-dot" />
            ΓΙΑ ΜΙΚΡΕΣ &amp; ΜΕΣΑΙΕΣ ΕΚΜΕΤΑΛΛΕΥΣΕΙΣ
          </p>
          <h1>
            Το τεφτέρι
            <br />
            του αγρότη.
            <br />
            Επιτέλους <mark>ψηφιακό.</mark>
          </h1>
          <p className="lp-lead">
            Κατέγραψε έξοδα, έσοδα και συγκομιδή σε τρία κλικ — ακόμα κι όταν δεν έχεις σήμα.
            Καθαρή εικόνα για κάθε χωράφι, στο κινητό σου.
          </p>
          <div className="lp-cta">
            <a className="lp-btn" href="#/">
              Ξεκίνα δωρεάν <Icon name="arrow" />
            </a>
            <a className="lp-link" href="#" onClick={(e) => scrollToId(e, 'features')}>
              Δες πώς δουλεύει <Icon name="down" size={16} />
            </a>
          </div>
          <ul className="lp-checks">
            {['3 κλικ ανά κίνηση', 'Λειτουργεί offline', 'Στα ελληνικά'].map((t) => (
              <li key={t}>
                <Icon name="check" size={14} />
                {t}
              </li>
            ))}
          </ul>
          <p className="lp-fine">Δοκιμαστική έκδοση · χωρίς κάρτα · χωρίς δέσμευση</p>
        </div>

        <div className="lp-visual" aria-hidden="true">
          <span className="lp-chip">
            <Icon name="wifiOff" size={14} /> Χωρίς σήμα; Δουλεύει.
          </span>
          <div className="lp-window">
            <div className="lp-window-bar">
              <i />
              <i />
              <i />
              <span>Agrilog.gr/app</span>
            </div>
            <div className="lp-app">
              <div className="lp-app-top">
                <b>
                  <span className="lp-logo-mark small">
                    <Icon name="leaf" size={14} />
                  </span>
                  Agrilog
                </b>
                <span className="lp-sync">● Συγχρονισμένο</span>
              </div>
              <small>Δευτέρα 26 Οκτωβρίου</small>
              <div className="lp-app-title">
                <h3>Καλησπέρα, Φώτη</h3>
                <span className="lp-select">Οκτώβριος 2026</span>
              </div>
              <div className="lp-kpis">
                {KPIS.map((k) => (
                  <div key={k.label} className={`lp-kpi ${k.cls}`}>
                    {k.label}
                    <strong>{k.value}</strong>
                    {k.note}
                  </div>
                ))}
              </div>
              <div className="lp-recent">
                <h4>Πρόσφατες</h4>
                {RECENT.map((r) => (
                  <div key={r.title} className="lp-row">
                    <span>
                      {r.title}
                      <small>{r.sub}</small>
                    </span>
                    <span className={r.pos ? 'lp-pos' : 'lp-neg'}>{r.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lp-entry">
            <h4>Νέα καταχώριση</h4>
            <p>Έξοδο · Ελιές Αγ. Παρασκευής</p>
            <div className="lp-amount">€86,40</div>
            <div className="lp-seg">
              <span className="on">Έξοδο</span>
              <span>Έσοδο</span>
              <span>Συγκομιδή</span>
            </div>
            <div className="lp-save">Αποθήκευση κίνησης</div>
          </div>
        </div>
      </section>

      <section className="lp-features" id="features">
        {FEATURES.map((f) => (
          <div key={f.title} className="lp-feature">
            <span className="lp-feature-icon">
              <Icon name={f.icon} size={20} />
            </span>
            <div>
              <strong>{f.title}</strong>
              <span>{f.text}</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

export default Landing