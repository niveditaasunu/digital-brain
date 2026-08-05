import math
import random
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from ..database import get_driver
from ..models import Neuron, NeuronCreate, NeuronUpdate, CATEGORY_COLORS

router = APIRouter(prefix="/api/neurons", tags=["neurons"])


def _row_to_neuron(record) -> Neuron:
    n = record["n"]
    return Neuron(
        id=n["id"],
        title=n["title"],
        description=n.get("description", ""),
        category=n["category"],
        tags=n.get("tags", []),
        color=n["color"],
        created_at=n["created_at"],
        x=n["x"],
        y=n["y"],
        z=n["z"],
    )


@router.get("", response_model=list[Neuron])
def list_neurons(
    category: str | None = Query(None, description="Filter by exact category"),
    q: str | None = Query(None, description="Search title/description/tags"),
):
    """
    Returns all neurons, optionally filtered by category and/or a search
    string. Search matches title, description, or tags, case-insensitively.
    """
    driver = get_driver()
    conditions = []
    params: dict = {}

    if category:
        conditions.append("n.category = $category")
        params["category"] = category

    if q:
        conditions.append(
            "(toLower(n.title) CONTAINS toLower($q) "
            "OR toLower(n.description) CONTAINS toLower($q) "
            "OR any(tag IN n.tags WHERE toLower(tag) CONTAINS toLower($q)))"
        )
        params["q"] = q

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    cypher = f"MATCH (n:Neuron) {where_clause} RETURN n ORDER BY n.created_at DESC"

    with driver.session() as session:
        result = session.run(cypher, params)
        return [_row_to_neuron(r) for r in result]


@router.post("", response_model=Neuron, status_code=201)
def create_neuron(payload: NeuronCreate):
    driver = get_driver()
    neuron_id = str(uuid.uuid4())
    color = payload.color or CATEGORY_COLORS.get(payload.category.value, "#22c55e")

    # Scatter new neurons in a rough sphere so they don't all stack at the
    # origin. This position is saved, not recomputed on every load.
    radius = random.uniform(3, 9)
    theta = random.uniform(0, 2 * math.pi)
    phi = random.uniform(0, math.pi)
    x = radius * math.sin(phi) * math.cos(theta)
    y = radius * math.sin(phi) * math.sin(theta)
    z = radius * math.cos(phi)

    created_at = datetime.now(timezone.utc).isoformat()

    cypher = """
    CREATE (n:Neuron {
        id: $id, title: $title, description: $description,
        category: $category, tags: $tags, color: $color,
        created_at: $created_at, x: $x, y: $y, z: $z
    })
    RETURN n
    """
    with driver.session() as session:
        result = session.run(
            cypher,
            id=neuron_id,
            title=payload.title,
            description=payload.description,
            category=payload.category.value,
            tags=payload.tags,
            color=color,
            created_at=created_at,
            x=x, y=y, z=z,
        )
        record = result.single()
        return _row_to_neuron(record)


@router.patch("/{neuron_id}", response_model=Neuron)
def update_neuron(neuron_id: str, payload: NeuronUpdate):
    driver = get_driver()
    updates = payload.model_dump(exclude_unset=True)
    if "category" in updates and updates["category"] is not None:
        updates["category"] = updates["category"].value if hasattr(updates["category"], "value") else updates["category"]

    if not updates:
        raise HTTPException(400, "No fields provided to update")

    set_clause = ", ".join(f"n.{key} = ${key}" for key in updates)
    cypher = f"""
    MATCH (n:Neuron {{id: $id}})
    SET {set_clause}
    RETURN n
    """
    with driver.session() as session:
        result = session.run(cypher, id=neuron_id, **updates)
        record = result.single()
        if record is None:
            raise HTTPException(404, "Neuron not found")
        return _row_to_neuron(record)


@router.delete("/{neuron_id}", status_code=204)
def delete_neuron(neuron_id: str):
    """Deletes the neuron and, via DETACH DELETE, every connection
    (synapse) touching it — matches Feature 7 in the spec."""
    driver = get_driver()
    cypher = "MATCH (n:Neuron {id: $id}) DETACH DELETE n RETURN count(n) as deleted"
    with driver.session() as session:
        result = session.run(cypher, id=neuron_id)
        record = result.single()
        if record is None or record["deleted"] == 0:
            raise HTTPException(404, "Neuron not found")
    return None
