# TDF Records UI Pro (React + Vite + MUI + React Query)

Polished scaffold for TDF Records frontend covering CRM, bookings, studio operations, education, finance, bar, and configuration workflows. The navigation tree mirrors the protected modules rendered by the authenticated layout so you can drill into each area without touching the router configuration.【F:src/App.tsx†L46-L165】【F:src/components/SideNav.tsx†L5-L121】

## Feature Highlights

- **Modular routing:** `App.tsx` declares authenticated sub-trees (CRM, Estudio, Escuela, Finanzas, etc.) with sensible redirects, legacy aliases, and guards powered by `RequireAuth`.【F:src/App.tsx†L33-L192】
- **Shared application shell:** `Layout` wraps every protected page with the TDF header, footer, responsive side navigation, and About dialog wiring.【F:src/components/Layout.tsx†L1-L47】
- **Role-aware navigation:** The side nav filters modules and submenu entries according to the normalized role visibility matrix in `config/menu.ts`.【F:src/components/SideNav.tsx†L5-L162】【F:src/config/menu.ts†L1-L99】
- **Studio & school flows:** Ready-made pages fetch lessons, packages, receipts, trial queues, finance documents, and more using React Query hooks and data tables.【F:src/features/lessons/TeacherLessons.tsx†L1-L55】【F:src/features/packages/PackageList.tsx†L1-L83】【F:src/features/receipts/ReceiptView.tsx†L1-L107】
- **Operations utilities:** Calendars, inventory, pipelines, and bar operations sit under the `/operacion` and `/bar` namespaces with placeholder screens ready for extension.【F:src/App.tsx†L87-L154】

## Architecture Overview

The entry point renders the React Router tree inside providers for authentication, theming, and React Query (see `main.tsx`). Authenticated routes use `RequireAuth`, which consults the context supplied by `AuthProvider` to decide whether to redirect to `/login`.【F:src/main.tsx†L1-L25】【F:src/App.tsx†L1-L45】【F:src/auth/AuthProvider.tsx†L1-L210】

### Authentication and authorization

`AuthProvider` persists credentials to session or local storage, renews inactivity timeouts, probes module access, and exposes helper methods (`login`, `loginWithToken`, `logout`) that downstream components consume. Unauthorized API responses trigger the provider’s global handler to force a logout.【F:src/auth/AuthProvider.tsx†L13-L221】

Role-based visibility is configured centrally in `config/menu.ts`, where role aliases normalize backend payloads before matching them to allowed modules/submodules. SideNav reads these tables to decide which sections to display for the current user.【F:src/config/menu.ts†L1-L138】【F:src/components/SideNav.tsx†L41-L162】

### Data fetching and caching

React Query powers API calls across the app—from `useBackendVersion` to feature-specific screens such as Teacher Lessons and Package List—providing loading/error states and cache invalidation.【F:src/hooks/useBackendVersion.ts†L1-L19】【F:src/features/lessons/TeacherLessons.tsx†L1-L36】【F:src/features/packages/PackageList.tsx†L1-L38】

### UI composition and theming

Material UI supplies the component system while `ColorModeProvider` builds a light/dark theme, syncs `<html>` classes, and persists explicit choices. Layout pieces (Header, Footer, AboutDialog, Theme toggle) compose the app shell and expose environment metadata like `VITE_API_BASE` and `VITE_TZ`.【F:src/theme/ColorModeProvider.tsx†L1-L111】【F:src/components/Layout.tsx†L1-L47】【F:src/components/AboutDialog.tsx†L1-L63】

### API layer

`src/api/client.ts` centralizes Axios configuration, Bearer token handling, error normalization, and helper methods (get/post/patch). Typed modules (parties, bookings, packages, invoices, inventory, etc.) wrap these helpers so feature code can focus on UI concerns. The `tdfApi` convenience object also backs the lite package and lesson explorers.【F:src/api/client.ts†L1-L210】

## Directory Guide

- `src/components` – shared UI building blocks, shell chrome, dialogs, and loading/error helpers.【F:src/components/Layout.tsx†L1-L47】
- `src/pages` – route-level screens for each module grouping (CRM, Estudio, Escuela, Finanzas, Bar, etc.).【F:src/App.tsx†L46-L165】
- `src/features` – focused widgets reused across routes (lessons, packages, receipts, payments, pipelines).【F:src/features/packages/PackageList.tsx†L1-L83】
- `src/api` – REST wrappers, type definitions, and domain-specific clients shared throughout the app.【F:src/api/client.ts†L1-L210】
- `src/theme` – color mode provider and MUI theme factory.【F:src/theme/ColorModeProvider.tsx†L1-L111】
- `src/constants` & `src/config` – enumerations (modules) and menu visibility matrices used for authorization-aware navigation.【F:src/config/menu.ts†L1-L138】

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

## Troubleshooting
- **CORS**: If browser blocks requests, enable CORS on API (e.g., `wai-cors`). Tighten to your static site origin in prod.
- **Calendar empty**: Ensure `/bookings` returns JSON and `VITE_API_BASE` points to your API.
- **SPA 404 on refresh**: Add the Render rewrite rule above.

## Testing
- Run the Vitest suite locally with `npm run test`. The setup uses jsdom and Testing Library utilities as declared in `package.json` and `src/setupTests.ts`.【F:package.json†L6-L40】【F:src/setupTests.ts†L1-L24】
