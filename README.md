# Intelligence Extraction Interface

A360-aligned UI for prompt-runner extraction outputs: patient extraction layers, opportunities kanban, and KPI dashboard.

## Stack

- React 19, TypeScript, Vite 7
- MUI 7, A360 theme
- @dnd-kit (kanban drag-and-drop), @mui/x-charts (dashboard)
- Axios, React Router, react-toastify, Zustand

## Running the app

The IE interface is the **frontend for the extraction layer**. To see it with real data you need the prompt-runner API running, then the IE app.

**1. Start the prompt-runner backend** (from the repo that contains the backend, usually the parent of `ie-interface`):

```bash
# From prompt-runner (or the directory where serve.py lives)
uvicorn serve:app --reload
```

Backend runs at `http://localhost:8000` by default. Alternatively use your deployed API (e.g. Railway); set that URL in the IE app env below.

**2. Start the IE interface** (this app):

```bash
cd ie-interface
npm install
cp .env.example .env
```

Edit `.env` and set `VITE_API_URL` to your backend URL (e.g. `http://localhost:8000`). No trailing slash.

```bash
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**). The app will show the nav (Runs, Opportunities, Agents, Dashboard) immediately; the Runs list will load data from the API or show an error/empty state if the API is unreachable or has no runs.

## Routes

- `/runs` — List extraction runs; click a run to see extraction layers.
- `/runs/:runId` — Patient extraction layers (summary, buy signal KPI, visit context, clinical constraints, products/services, opportunities).
- `/opportunities` — Kanban board (drag cards between New, In progress, Won, Lost).
- `/dashboard` — KPI charts (opportunities by stage, buy signal distribution).

## Deploy to the web (Vercel)

1. **Push the app to GitHub** (if not already), e.g. a repo that contains the `ie-interface` folder or has this project as its root.

2. **Go to [vercel.com](https://vercel.com)** and sign in. Click **Add New** → **Project** and import your repository.

3. **Configure the project:**
   - **Root Directory:** If the repo root is the parent of `ie-interface`, set this to `ie-interface`. Otherwise leave as `.`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (Vite default)
   - **Environment variables:** Add:
     - `VITE_API_URL` = your prompt-runner API URL (e.g. `https://your-prompt-runner.up.railway.app` or your Railway backend URL). No trailing slash.

4. **Deploy.** Vercel will build and host the app. Your site will be at `https://<project-name>.vercel.app` (or your custom domain).

5. **CORS:** Ensure your prompt-runner backend allows the Vercel origin (e.g. `https://your-project.vercel.app`) in its CORS config (e.g. `CORS_ORIGINS` on Railway).

Optional: to add a **password gate** (like the prompt-runner admin), add env var `VITE_APP_PASSWORD` and wrap the app in a password gate component that checks it before rendering.

---

## API

Expects prompt-runner backend with:

- `GET /runs` — list runs (array or `{ data: Run[] }`)
- `GET /runs/:id` — run detail with `outputs.prompt_1`, `prompt_2`, `prompt_3`
- `GET /opportunities` — list opportunities (array or `{ data: Opportunity[] }`)
- `PATCH /opportunities/:id` — body `{ stage: "New" | "In progress" | "Won" | "Lost" }`
