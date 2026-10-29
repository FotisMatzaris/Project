# Agrilog

Εφαρμογή διαχείρισης αγροτικών χωραφιών (όνομα, καλλιέργεια, στρέμματα).

- **Backend:** ASP.NET Core 8 (minimal API) + Entity Framework Core + PostgreSQL
- **Frontend:** React 19 + Vite

## Προαπαιτούμενα

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) 20+
- PostgreSQL (να τρέχει στο `localhost:5432`)

## Ρύθμιση βάσης

Ο κωδικός της βάσης **δεν** αποθηκεύεται στο repo. Όρισέ τον τοπικά με user-secrets:

```bash
cd Backend
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=agrilog_db;Username=postgres;Password=ΟΚΩΔΙΚΟΣ_ΣΟΥ"
```

Η βάση `agrilog_db` και ο πίνακας δημιουργούνται αυτόματα με την πρώτη εκκίνηση (Development).

## Εκκίνηση

Backend (http://localhost:5008, Swagger στο `/swagger`):

```bash
cd Backend
dotnet run --launch-profile http
```

Frontend (http://localhost:5173):

```bash
cd Frontend
npm install
npm run dev
```

Το Vite προωθεί τις κλήσεις `/api/*` στο backend (`http://localhost:5008`), οπότε δεν χρειάζεται επιπλέον ρύθμιση.

## API

| Μέθοδος | Διαδρομή | Περιγραφή |
|---|---|---|
| GET | `/api/fields` | Λίστα χωραφιών |
| GET | `/api/fields/{id}` | Ένα χωράφι |
| POST | `/api/fields` | Δημιουργία |
| PUT | `/api/fields/{id}` | Ενημέρωση |
| DELETE | `/api/fields/{id}` | Διαγραφή |

Παράδειγμα σώματος: `{ "name": "Χωράφι Νάουσα", "cropType": "Ροδάκινα", "sizeInStremmata": 12.5 }`
