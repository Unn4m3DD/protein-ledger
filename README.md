# Protein Ledger

Next.js App Router + React + TypeScript, Tailwind CSS, shadcn/ui (Radix), Lucide icons, and libSQL storage.

## Run locally

Requires Node.js 20.9+.

```sh
npm ci
npm run dev
```

Open http://localhost:8765. Existing saved foods and UUID accounts are preserved in `data/foods.sqlite3`. No environment variables are needed locally.

```sh
npm test
npm run build
npm start
```

## Deploy to Vercel

Use the repository root as the Vercel project root. The framework preset is **Next.js**. Default build and output settings work; there is no custom server.

Create a **Turso libSQL** database and set these server-side environment variables in Vercel before deploying:

- `TURSO_DATABASE_URL`: the `libsql://…` database URL.
- `TURSO_AUTH_TOKEN`: its auth token.

See `.env.example`. Do not prefix these with `NEXT_PUBLIC_`. The schema is initialized automatically on the first database request. Local file storage is intentionally disabled on Vercel. The calculator works without a database; saving and loading require the database configuration.

To carry local saved foods into the hosted database, import `data/foods.sqlite3` into Turso using its database import workflow before the first hosted write. The schema and UUID identifiers are unchanged. Local data is not committed or uploaded automatically.

## Behavior

- Inputs start empty except serving size, which defaults to 100 g. Reset restores these defaults, clears the food name, and exits edit mode without changing saved foods.

- Density = serving protein ÷ serving calories × 100.
- Container protein = serving protein × container size ÷ serving size.
- Cost = container price × 100 ÷ container protein (euro cents per gram).
- Each result needs only its own inputs. Missing inputs remain null. Carbs and fat are optional. Partial foods can be saved.
- The calorie error uses protein × 4 + carbs × 4 + fat × 9; blank macros contribute zero. It appears when this total exceeds entered calories, without disabling calculations.
- Sizes are entered in grams. Older saved rows retain their original unit.
- Density colors range from red at ≤5 g to green at ≥20 g per 100 kcal. Cost colors range from green at ≤3¢ to red at ≥20¢ per gram. Missing metrics sort last.
- Edit a saved food with its pencil action. Save changes updates the same row; Cancel restores the previous calculator draft.
- Theme defaults to System, with persisted Light and Dark overrides.

## UUID login

The UUIDv4 is the sole secret bearer identifier. Sign Up creates a UUID; Sign In validates one. Account pages use `/u/<uuid>/foods`. All API reads and writes filter by the URL UUID; a submitted owner field is ignored. Anyone with the UUID or URL can access that ledger. There is no recovery. Password-manager autofill is supported on the UUID field.

Production environment variables are managed in Vercel. Local SQLite data is excluded from deployment uploads.
