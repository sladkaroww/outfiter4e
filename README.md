# outfiter.

A social wardrobe: share outfits, like what others wear, and keep a private
digital wardrobe. Built with Next.js 16 (App Router), Clerk and Neon.

- **Postgres** (Neon) stores users' wardrobe items, outfit posts, the
  post → item links and likes.
- **Object Storage** (Neon, S3-compatible) stores the images. Postgres keeps
  only the object key; signed download URLs are generated when data is read.
- Signed-in visitors go straight to `/feed`; the marketing page is only shown
  when signed out.
- The feed is an Instagram-style single column (max 500px) with 4:5 photos and
  a floating dock over the page: Feed, Wardrobe, Add (+), Profile.
- The header wardrobe icon opens a small menu: **Към гардероба** or
  **Добави дреха** (opens the upload modal without leaving the page).
- Upload forms finish with a glowing submit button and a morphing label.
- Every post has a **Реагирай** (react/like) button; own posts also have an
  **Изтрий** action with a confirmation step (owner check is enforced in the
  API, not just hidden in the UI).

## UI: Yamada UI v2

Typography is **Allo**, Josh Puckett's open-source variable typeface (SIL OFL
1.1). The variable `woff2` and its license live in `public/fonts/`; it is
self-hosted, preloaded, and used for both the app CSS and the Yamada theme.
Allo is used everywhere, including headings and the hero accent.

Every interactive element comes from [Yamada UI](https://yamada-ui.com)
(`@yamada-ui/react`):

| Yamada component | Used for |
| --- | --- |
| `Button`, `IconButton` | all CTAs, like button, delete, plus menu trigger |
| `Field`, `Input`, `Textarea`, `NativeSelect` | every form in the upload modals |
| `Modal` | item and outfit upload dialogs (overlay, focus trap, Escape) |
| `Dropzone` | image upload with drag & drop, size and type validation |
| `Menu` | the "+" menu with *Качи аутфит* / *Добави към гардероба* |
| `Alert` | database/storage problems and request errors |
| `EmptyState` | empty wardrobe and empty feed |
| `Tag` | outfit item tags and filter chips |
| `Avatar`, `Skeleton` | author avatars and loading placeholders |
| `Image` | post, wardrobe and hero images |
| `Link` | header navigation |

- `src/components/providers.tsx` mounts `UIProvider` with `src/theme` (fonts +
  cream/ink palette, always light mode).
- `src/components/ui/` holds thin wrappers (`AppButton`, `AppIconButton`,
  `AppField`, `AppInput`, `AppTag`, `AppChip`, `AppAvatar`, `AppSkeleton`,
  `AppModal`, `ImageDropzone`) that apply the app's design tokens to Yamada
  primitives.
- `src/app/layout.tsx` hoists Emotion's inline `<style>` tags into `<head>`
  before React hydrates. Yamada UI renders them inside `<body>` during SSR but
  inserts them into `<head>` on the client, which otherwise triggers a
  hydration mismatch in Next.js 16.

## AI clothing identification (Gemini, free tier)

When you pick a photo in **Добави дреха**, the app sends it to Gemini and fills
in the name, type, color and description. Everything stays editable before
saving, and the form still works normally without AI.

1. Create a free key at <https://aistudio.google.com/apikey>.
2. Add it to `.env.local` (and to Vercel for production):

```bash
GEMINI_API_KEY=your-key
# optional, defaults to gemini-flash-lite-latest
GEMINI_MODEL=
```

Notes:

- Default model is `gemini-flash-lite-latest` (Flash-Lite, free tier). Use
  `GEMINI_MODEL` to switch, e.g. to a Gemma model. The model must accept image
  input and JSON-schema responses for best results.
- Free-tier quotas differ per project and model (Gemma and Flash-Lite have
  separate limits); check the **Limits** page in AI Studio. Quota errors are
  surfaced as a readable Bulgarian message.
- Only the selected photo is sent to Google's API; nothing is stored by the AI
  call itself.
- Without a key the modal shows "AI разпознаването не е настроено" and the rest
  of the app keeps working. `GET /api/health` reports `ai.configured` and the
  active model.

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run db:push              # creates the tables from db/schema.sql
npm run dev
```

Open <http://localhost:3000>.

### Environment

| Variable | Where it comes from |
| --- | --- |
| `DATABASE_URL` | Neon Console → Connect → **pooled** connection string |
| `DATABASE_URL_UNPOOLED` | same screen, **direct** connection string (migrations) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Clerk dashboard → API keys |
| `NEON_STORAGE_BUCKET` | `wardrobe-images` |
| `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | `neon env pull` (writes them into `.env.local`) |

With the Neon CLI the whole `.env.local` can be filled in for you:

```bash
neon link                       # connect this folder to your Neon project
neon env pull -s postgres -s object-storage
neon bucket create wardrobe-images --access-level private   # once per branch
```

### Database schema

`db/schema.sql` is idempotent — it uses `create table if not exists`, so it can
be applied to a fresh database or re-applied after pulling changes:

```bash
npm run db:push
```

The command prints the PostgreSQL version, the tables it verified and current
row counts. It uses `DATABASE_URL_UNPOOLED` when present because schema changes
should not go through the connection pooler.

## Troubleshooting "nothing is saved"

Open **`/api/health`** — it reports whether the database is configured,
reachable, whether the schema is applied, and whether image storage is ready.

| Health output | Fix |
| --- | --- |
| `database.configured: false` | `DATABASE_URL` is missing from `.env.local`; restart `npm run dev` after adding it |
| `database.schemaReady: false` | run `npm run db:push` |
| `database.reachable: false` | wrong password/host, project suspended, or IP allow list |
| `storage.configured: false` | add the `AWS_*` variables (run `neon env pull`) |

The app also shows a banner on `/feed` and `/wardrobe` when writes cannot work,
instead of silently losing data.

## Deploying to Vercel

Import the repository, then add these environment variables to the project:

- `DATABASE_URL`, `DATABASE_URL_UNPOOLED`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `NEON_STORAGE_BUCKET`, `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`,
  `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`

Apply the schema to the production branch once with
`DATABASE_URL_UNPOOLED=<production direct url> npm run db:push`.