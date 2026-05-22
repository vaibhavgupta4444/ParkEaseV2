# ParkEase Frontend

React + Vite frontend for the ParkEase consumer app.

## Structure

- `src/api` for HTTP setup and endpoints
- `src/features` for auth, dashboard, and profile flows
- `src/pages` for route-level screens
- `src/components` for shared UI and layout pieces

## Run

From this folder:

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - start the local dev server
- `npm run build` - create a production build
- `npm run lint` - run ESLint
- `npm run preview` - preview the built app

## Notes

- Uses the shared backend API at `VITE_API_BASE_URL`.
- Handles user login, search, bookings, and settings.
