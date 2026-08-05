import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import verify_connectivity, close_driver
from .routers import neurons, connections


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fail fast on startup if Neo4j credentials are wrong, rather than
    # returning a confusing 500 on the user's first click.
    verify_connectivity()
    yield
    close_driver()


app = FastAPI(title="Digital Brain API", version="0.1.0", lifespan=lifespan)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(neurons.router)
app.include_router(connections.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
