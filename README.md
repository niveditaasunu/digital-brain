# Digital Brain v0.1

A 3D knowledge graph — ideas as glowing neurons, relationships as synapses.

This is a working implementation of the v0.1 spec: create/edit/delete neurons,
manual connections, categories with colors, search, filtering, and a landing
page. Data is persisted in Neo4j Aura, so it survives closing the browser.

## Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + React Three Fiber (Three.js)
- **Backend:** FastAPI
- **Database:** Neo4j (Aura cloud)

## Prerequisites

- Node.js 18+ and npm (`node -v`, `npm -v`)
- Python 3.10+ (`python --version`)
- A Neo4j Aura Free instance (URI + username + password)

## 1. Backend setup

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Open `.env` and fill in the three values from your Aura instance:

```
NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password-here
```

Run the server:

```powershell
uvicorn app.main:app --reload --port 8000
```

Visit **http://localhost:8000/api/health** — you should see `{"status":"ok"}`.
If instead you get an error about missing credentials or connectivity, double
check your `.env` values and that the Aura instance status is "Running".

Interactive API docs are auto-generated at **http://localhost:8000/docs** —
useful for testing endpoints directly before the frontend is wired up.

## 2. Frontend setup

Open a **second** terminal (leave the backend running in the first one):

```powershell
cd frontend
npm install
npm run dev
```

Visit **http://localhost:5173**. You should see the landing page, then
"Enter Brain" takes you into the empty 3D space. Click the `+` button to
create your first neuron.

## How the pieces fit together

```
frontend (5173) --HTTP--> backend (8000) --Bolt driver--> Neo4j Aura (cloud)
```

- `backend/app/database.py` — single Neo4j driver instance, created once at startup
- `backend/app/routers/neurons.py` — create/read/update/delete + search/filter
- `backend/app/routers/connections.py` — create/delete synapses between neurons
- `frontend/src/api/client.ts` — typed fetch wrapper calling the FastAPI routes
- `frontend/src/components/BrainScene.tsx` — the R3F `<Canvas>` and camera controls
- `frontend/src/components/NeuronMesh.tsx` — one glowing sphere per idea
- `frontend/src/components/ConnectionLine.tsx` — pulsing lines between connected neurons
- `frontend/src/pages/Brain.tsx` — fetches data, owns UI state, composes everything

## Using it

- **Create a neuron:** click `+` top-right, fill in title/description/category/tags
- **Connect two neurons:** open a neuron's panel → "Connect to another neuron" → click the second neuron in the 3D view
- **Edit:** click a neuron → "Edit" in the side panel
- **Delete:** click a neuron → "Delete neuron" (also removes its connections)
- **Search:** top-right search box fades out non-matching neurons
- **Filter by category:** pills at top-left
- **Navigate:** left-click + drag to rotate, scroll to zoom, right-click + drag to pan

## Known limitations (intentional, for v0.1)

- No AI features yet (auto-connections, semantic search) — the graph structure
  is designed so these can be added later without a data model change.
- No authentication — this is a single-user local app for now.
- No automated tests yet.
- Positions are assigned once at creation (random point on a sphere) and
  persisted — the layout won't auto-arrange itself as the graph grows.

## Troubleshooting

- **"Couldn't reach the backend" banner in the UI:** the FastAPI server isn't
  running, or it's on a different port than `http://localhost:8000`. Check
  the first terminal.
- **Backend fails to start with a Neo4j error:** check `backend/.env` values
  against what Aura shows for your instance, and confirm the instance status
  is "Running" (not "Paused").
- **CORS error in the browser console:** confirm `CORS_ORIGINS` in
  `backend/.env` includes `http://localhost:5173` (it does by default).
