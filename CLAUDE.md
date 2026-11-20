# Agrilog

## Τι είναι
Web εφαρμογή (ψηφιακό τεφτέρι) για αγρότες: διαχείριση χωραφιών, συγκομιδών, εσόδων/εξόδων, εργασιών και ψεκασμών. Την φτιάχνει φοιτητής Πληροφορικής (3ο έτος) ως project για το βιογραφικό του. Την έμπνευση έδωσε το χειρόγραφο τετράδιο του πατέρα του, που κατέγραφε: χωράφια (πόσα, πού, ηλικία καλλιέργειας, στρέμματα, καλλιέργεια), ποσότητα παραγωγής και τιμή πώλησης, εργασίες, έξοδα.

Στόχος: χρήση από υπολογιστή και κινητό (αργότερα εφαρμογή στο Play Store).
Απώτερος στόχος: χάρτης χωραφιών από δορυφόρο και αισθητήρας υγρασίας εδάφους που προτείνει πότε και πόση ώρα να ποτίσει, ανάλογα με την καλλιέργεια.

## Stack
- Backend: C# / ASP.NET Core 8 (minimal API), Entity Framework Core, PostgreSQL (Npgsql). Φάκελος `Backend/`.
- Frontend: React 19 + Vite (JavaScript/JSX). Φάκελος `Frontend/`.
- Ανάπτυξη σε Windows, PowerShell, VS Code.

## Δομή
- `Backend/Program.cs`: ρυθμίσεις, CORS (από `Cors:AllowedOrigins`), Swagger, αυτόματο migrate στο Development. Το UseHttpsRedirection είναι ενεργό μόνο εκτός Development.
- `Backend/Endpoints/FieldEndpoints.cs`: CRUD στο `/api/fields` με validation.
- `Backend/Models/Field.cs` (Id, Name, CropType, SizeInStremmata) και `FieldInput.cs` (είσοδος χωρίς Id).
- `Backend/Data/AppDbContext.cs`, `Backend/Migrations/`.
- `Frontend/index.html`: το landing page. Είναι στατικό, αυτόνομο HTML και όχι React.
- `Frontend/app/index.html` και `Frontend/src/`: η React εφαρμογή στο `/app/`. Το `src/App.jsx` έχει φόρμα και λίστα χωραφιών, και το `src/api.js` τις κλήσεις στο `/api/fields`.
- `Frontend/vite.config.js`: δύο σελίδες (`/` και `/app/`) και proxy `/api` προς `http://localhost:5008`.
- Η διάταξη landing + `/app/` ίσως βρίσκεται ακόμα στο branch `Peirama` μέχρι να γίνει merge στο `main`.

## Εκτέλεση
- Backend (από `Backend/`): `dotnet run --launch-profile http` → http://localhost:5008, Swagger στο `/swagger`.
- Frontend (από `Frontend/`): `npm install` και μετά `npm run dev` → http://localhost:5173/ (landing) και `/app/` (εφαρμογή).
- Ο κωδικός της βάσης ΔΕΝ είναι στο repo. Ορίζεται τοπικά:
  `dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=agrilog_db;Username=postgres;Password=..."`
  Το `appsettings.json` έχει placeholder `CHANGE_ME`. Η βάση και οι πίνακες δημιουργούνται αυτόματα στο Development.
- Αν το PowerShell μπλοκάρει το npm: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

## Αποφάσεις και γνωστά σημεία
- Swagger: στο `Backend.csproj` είναι καρφωμένο το `Microsoft.OpenApi` 1.6.22 και έχει αφαιρεθεί το `Microsoft.AspNetCore.OpenApi`. Αλλιώς το Swagger UI δεν φορτώνει.
- Αλλαγές στο σχήμα της βάσης γίνονται μόνο με migration (`dotnet ef migrations add ...`).
- Ποτέ κωδικοί ή κλειδιά στο repo. Ένας παλιός κωδικός βάσης υπάρχει στο ιστορικό του git και πρέπει να αλλαχτεί αν χρησιμοποιείται αλλού.
- Το landing υπόσχεται λειτουργίες που δεν υπάρχουν ακόμα (offline, εξαγωγή CSV, έσοδα και έξοδα σε τρία κλικ). Η φόρμα επικοινωνίας είναι demo και δεν στέλνει email, και το info@agrilog.gr είναι δείγμα. Να μην δημοσιευτεί πριν υλοποιηθούν.

## Git
- Repo: https://github.com/FotisMatzaris/Project
- Το `main` έχει κανόνα pull request. Δουλεύουμε στο branch `Peirama` και ανοίγουμε PR στο GitHub.

## Roadmap (με σειρά)
1. Ολοκλήρωση και merge του landing.
2. Εμπλουτισμός χωραφιού: τοποθεσία, ποικιλία, έτος φύτευσης (η ηλικία υπολογίζεται), στρέμματα, αριθμός δέντρων, τρόπος ποτίσματος, τύπος εδάφους, σημειώσεις. Η λίστα δεν έχει οριστικοποιηθεί.
3. Χάρτης (π.χ. Leaflet): σχεδίαση περιγράμματος, αποθήκευση GeoJSON, αυτόματος υπολογισμός στρεμμάτων.
4. Συγκομιδές, έσοδα, έξοδα.
5. Εργασίες και ψεκασμοί.
6. Λογαριασμοί χρηστών (δεδομένα ανά χρήστη) και δημοσίευση.
7. Προσομοιωμένος αισθητήρας υγρασίας και σύσταση ποτίσματος.
8. Πραγματικός αισθητήρας.
Κάθε λειτουργία χτίζεται από άκρη σε άκρη (βάση, endpoint, οθόνη), ώστε να δοκιμάζεται.

## Συνεργασία με τον χρήστη
- Απάντα στα ελληνικά.
- Ο χρήστης είναι αρχάριος σε git και τερματικό: εξήγησε τι κάνει κάθε εντολή πριν την τρέξεις. Μην κάνεις force push και μην πειράζεις το `main` απευθείας.
- Προτιμά ακριβή βήματα, πλήρη κώδικα και ένα βήμα τη φορά.
- Κάνε μικρές, ολοκληρωμένες αλλαγές και δοκίμασε (build, lint) πριν πεις ότι δουλεύει.