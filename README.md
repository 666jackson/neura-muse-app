# Neura Muse — Cybernetic Character Archive

Cinematic cyber-character archive: public site + admin CMS.
React + Tailwind + Framer Motion + Supabase (Postgres / Auth / Storage), PWA-ready, deployable to Vercel.

## Setup

1. **Supabase**
   - Create a project at supabase.com
   - Run `supabase/schema.sql` in the SQL editor (tables, RLS, storage buckets)
   - Authentication → Users → create your admin account
   - SQL: `insert into public.admins (user_id) values ('<your-user-uuid>');`

2. **Env**
   ```
   cp .env.example .env
   # fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Project Settings → API)
   ```

3. **Run**
   ```
   npm install
   npm run dev
   ```

4. **Deploy (Vercel)**
   - Import the repo, framework preset: Vite
   - Add the two env vars in Vercel Project Settings
   - SPA rewrite: `vercel.json` included

## Routes
- `/` — public archive (reads only `is_public = true` characters)
- `/admin/login` — Supabase Auth sign-in
- `/admin/dashboard` — character CRUD, cover upload, .glb/.gltf model upload, video import, publish toggle

## Motion reels (video)
Each character has a `video_url`. In the admin **Motion Reel** panel, use **導入影片
(Import video)** to upload a clip into the `videos` bucket. Reels play full-bleed as the
home hero background, in the archive detail panel, and on card hover.

## Notes
- 3D Showroom renders `model_url` (.glb/.gltf) via <model-viewer>; falls back to a CSS hologram when absent.
- Upload Lab stores fan images in the `uploads` bucket and logs the mock analysis to the `uploads` table.
- PWA via vite-plugin-pwa — add real icons at `public/icons/icon-192.png` and `icon-512.png`.
- Run the migration block at the bottom of `supabase/schema.sql` on existing projects to add the video columns + bucket.
