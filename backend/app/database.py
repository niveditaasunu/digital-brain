"""
Owns the single Neo4j driver instance for the whole app.

Why a singleton: the Neo4j driver already manages an internal connection
pool. You create ONE driver when the app starts and reuse it for every
request — you do NOT open a new driver per request.
"""
import os
from neo4j import GraphDatabase, Driver
from dotenv import load_dotenv

load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

_driver: Driver | None = None


def get_driver() -> Driver:
    global _driver
    if _driver is None:
        if not NEO4J_URI or not NEO4J_USERNAME or not NEO4J_PASSWORD:
            raise RuntimeError(
                "Missing Neo4j credentials. Copy backend/.env.example to "
                "backend/.env and fill in your Aura URI/username/password."
            )
        _driver = GraphDatabase.driver(
            NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD)
        )
    return _driver


def close_driver() -> None:
    global _driver
    if _driver is not None:
        _driver.close()
        _driver = None


def verify_connectivity() -> None:
    """Call once on startup so a bad password fails fast and loudly,
    instead of surfacing as a mystery 500 on the first real request."""
    get_driver().verify_connectivity()
