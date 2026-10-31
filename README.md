# DV1677 HT26 Grupp 4 – Frontend

Frontend för grupp 4:s projekt i kursen DV1677 JavaScript-baserade webbramverk vid Blekinge Tekniska Högskola.

Projektet är en webbaserad text- och kodeditor byggd med React och Vite. Användare kan skapa, redigera, dela och kommentera dokument. Applikationen använder Socket.IO för realtidsredigering och Monaco Editor för kodredigering.

## Gruppmedlemmar

- Hussein Sabte – GitHub: [ZEZZ3](https://github.com/ZEZZ3)
- Daud Nawaz – GitHub: [Daudnaw](https://github.com/Daudnaw)

## Tekniker

- React och Vite
- JavaScript
- Socket.IO Client
- Monaco Editor
- JWT för autentisering
- Vitest och React Testing Library för automatiserade tester
- GitHub Actions och GitHub Pages för deployment

## Länkar

**Driftsatt frontend:**

https://zezz3.github.io/dv1677-ht26-grupp4-frontend/

**Frontend-repository:**

https://github.com/ZEZZ3/dv1677-ht26-grupp4-frontend

**Backend-repository:**

https://github.com/Daudnaw/dv1677-ht26-grupp4-backend

**Backend API:**

https://dv1677-crusher.nplab.bth.se/api

Observera att vissa API-endpoints kräver en giltig JWT-token.

## Funktionalitet

- Registrering och inloggning med JWT
- Skapa, visa, redigera och ta bort dokument
- Dela dokument med andra användare
- Realtidsredigering med Socket.IO
- Kommentera dokument och uppdatera kommentarer i realtid
- Välja mellan textdokument och koddokument
- Kodredigering med Monaco Editor
- Syntaxfärgning för flera programmeringsspråk
- Automatisk sparning av dokumentändringar
- Integration med backend för Discord-notifieringar

## Köra projektet lokalt

Klona projektet:

```bash
git clone https://github.com/ZEZZ3/dv1677-ht26-grupp4-frontend.git
cd dv1677-ht26-grupp4-frontend
```

Installera beroenden:

```bash
npm install
```

Skapa en `.env`-fil med hjälp av `.env.example`:

```bash
cp .env.example .env
```

Ange backend-API:ets adress:

```env
VITE_API_URL=https://dv1677-crusher.nplab.bth.se/api
```

Starta utvecklingsservern:

```bash
npm run dev
```

Öppna adressen som visas i terminalen, vanligtvis `http://localhost:5173/`.

## Tester

Frontend använder Vitest och React Testing Library.

Kör testerna:

```bash
npm test
```

För att köra testerna i bevakningsläge:

```bash
npm run test:watch
```

Testerna finns i `src/App.test.jsx`.

## Bygga projektet

```bash
npm run build
```

Den färdiga versionen skapas i katalogen `dist`.

För att förhandsgranska den byggda versionen:

```bash
npm run preview
```

## Deployment

Frontenden driftsätts automatiskt till GitHub Pages via GitHub Actions vid push till `main` eller `dev`.

Vid deployment används miljövariabeln `VITE_API_URL` för att ansluta till det driftsatta backend-API:t.

Workflow-filen finns i `.github/workflows/deploy.yml`.