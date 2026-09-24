# DV1677 HT26 Grupp 4 - Frontend

Frontend för grupp 4:s projekt i kursen DV1677 JavaScript-baserade webbramverk.

Projektet är en fristående SPA byggd med React och Vite. Frontenden kommunicerar med gruppens JSON-API och kan lista dokument samt visa innehållet i ett valt dokument.

## Gruppmedlemmar

- Hussein Sabte - GitHub: ZEZZ3
- Daud Nawaz - GitHub: Daudnaw

## Teknik

- React
- Vite
- JavaScript

## Driftsatt applikation

Frontend (GitHub Pages):

https://ZEZZ3.github.io/dv1677-ht26-grupp4-frontend/

Backend API:

https://dv1677-crusher.nplab.bth.se/api/documents

## Köra projektet lokalt

Klona repot och installera dependencies:

```bash
npm install
```

Skapa en `.env`-fil i projektets rot. Du kan utgå från `.env.example`:

```bash
cp .env.example .env
```

Filen ska innehålla:

```env
VITE_API_URL=https://dv1677-crusher.nplab.bth.se/api
```

Starta utvecklingsservern:

```bash
npm run dev
```

Öppna sedan adressen som Vite visar i terminalen, normalt:

```text
http://localhost:5173/
```

## Build

För att bygga projektet:

```bash
npm run build
```

```

Den färdiga versionen skapas i katalogen `dist`.


## Deployment

Frontenden driftsätts automatiskt till GitHub Pages med GitHub Actions vid push till `main`.

Vid deployment används miljövariabeln `VITE_API_URL` för adressen till det driftsatta backend-API:t.