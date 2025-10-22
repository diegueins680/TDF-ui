
# TDF Records UI Pro (React + Vite + MUI + React Query)

Polished scaffold for TDF Records frontend:
- **Parties** (CRM) with MUI table + search + create/edit dialogs (RHF + Zod).
- **Bookings** calendar using FullCalendar, wired to `/bookings` (GET/POST).
- **Pipelines** Kanban for Mixing/Mastering (hello-pangea/dnd); API hook present.

## Local Development
```bash
npm install
echo "VITE_API_BASE=http://localhost:8080" > .env
echo "VITE_TZ=America/Guayaquil" >> .env
npm run dev   # http://localhost:5173
```

> Ensure your backend enables CORS for your frontend origin during development and production. See the `wai-cors` Main.hs pattern we discussed. (Use a permissive policy now; restrict origins later.)

## Render (Static Site) Deploy
- **Build Command:** `npm ci && npm run build` (or `npm install && npm run build` if you do not commit a lockfile)
- **Publish Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_BASE=https://<your-api>.onrender.com`
  - `VITE_TZ=America/Guayaquil`
- **SPA Rewrite Rule:**
  - Source: `/*`
  - Destination: `/index.html`
  - Action: `Rewrite`

## Pages
- `/parties` — list, search, new party, edit Instagram
- `/bookings` — calendar; drag-select to create
- `/pipelines` — drag cards across stages (persists to API when available)

## Wire Pipelines to Backend
When your API exposes endpoints like:
- `PATCH /pipelines/mixing/:id` `{ "stage": "Revisions" }`
- `PATCH /pipelines/mastering/:id` `{ "stage": "Approved" }`

Edit `src/api/pipelines.ts` if needed; the UI already calls `updateStage(card, newStage)` on drop.

## Troubleshooting
- **CORS**: If browser blocks requests, enable CORS on API (e.g., `wai-cors`). Tighten to your static site origin in prod.
- **Calendar empty**: Ensure `/bookings` returns JSON and `VITE_API_BASE` points to your API.
- **SPA 404 on refresh**: Add the Render rewrite rule above.
