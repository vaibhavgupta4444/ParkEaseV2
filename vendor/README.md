# ParkEase Vendor

Standalone React + Vite vendor console for ParkEase.

## Run

From this folder:

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - start the vendor console
- `npm run build` - create a production build
- `npm run lint` - run ESLint
- `npm run preview` - preview the built app

## Notes

- Uses `VITE_API_BASE_URL` to reach the shared backend.
- Stores the vendor token locally so the console can open independently.
- Uses the same JS-only, frontend-style source layout as the main frontend app.
