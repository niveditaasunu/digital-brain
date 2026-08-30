import math
import random
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query

from ..database import get_driver
from ..models import (
    Neuron,
    NeuronCreate,
    NeuronUpdate,
    CATEGORY_COLORS,
)
from .auth import get_current_user_id


router = APIRouter(
    prefix="/api/neurons",
    tags=["neurons"],
)


def _row_to_neuron(record) -> Neuron:
    n = record["n"]

    return Neuron(
        id=n["id"],
        title=n["title"],
        description=n.get("description", ""),
        type=n.get("type", "Custom"),
        why_created=n.get("why_created", ""),
        category=n["category"],
        tags=n.get("tags", []),
        color=n["color"],
        created_at=n["created_at"],
        x=n["x"],
        y=n["y"],
        z=n["z"],
    )


# ============================================================
# LIST NEURONS
# ============================================================

@router.get("", response_model=list[Neuron])
def list_neurons(
    category: str | None = Query(
        None,
        description="Filter by exact category",
    ),
    q: str | None = Query(
        None,
        description="Search title/description/tags",
    ),
    user_id: str = Depends(get_current_user_id),
):

    driver = get_driver()

    conditions = [
        "n.user_id = $user_id"
    ]

    params: dict = {
        "user_id": user_id
    }

    if category:
        conditions.append(
            "n.category = $category"
        )
        params["category"] = category

    if q:
        conditions.append(
            """
            (
                toLower(n.title) CONTAINS toLower($q)
                OR toLower(n.description) CONTAINS toLower($q)
                OR toLower(n.why_created) CONTAINS toLower($q)
                OR any(
                    tag IN n.tags
                    WHERE toLower(tag) CONTAINS toLower($q)
                )
            )
            """
        )

        params["q"] = q

    where_clause = (
        "WHERE " + " AND ".join(conditions)
    )

    cypher = f"""
    MATCH (n:Neuron)
    {where_clause}
    RETURN n
    ORDER BY n.created_at DESC
    """

    with driver.session() as session:

        result = session.run(
            cypher,
            params,
        )

        return [
            _row_to_neuron(r)
            for r in result
        ]


# ============================================================
# CREATE NEURON
# ============================================================

@router.post(
    "",
    response_model=Neuron,
    status_code=201,
)
def create_neuron(
    payload: NeuronCreate,
    user_id: str = Depends(get_current_user_id),
):

    driver = get_driver()

    neuron_id = str(uuid.uuid4())

    color = (
        payload.color
        or CATEGORY_COLORS.get(
            payload.category.value,
            "#22c55e",
        )
    )

    # Scatter new neurons in a rough sphere
    # so they don't all stack at the origin.
    radius = random.uniform(3, 9)

    theta = random.uniform(
        0,
        2 * math.pi,
    )

    phi = random.uniform(
        0,
        math.pi,
    )

    x = (
        radius
        * math.sin(phi)
        * math.cos(theta)
    )

    y = (
        radius
        * math.sin(phi)
        * math.sin(theta)
    )

    z = radius * math.cos(phi)

    created_at = (
        datetime.now(timezone.utc)
        .isoformat()
    )

    cypher = """
    CREATE (n:Neuron {
        id: $id,
        user_id: $user_id,
        title: $title,
        description: $description,
        type: $type,
        why_created: $why_created,
        category: $category,
        tags: $tags,
        color: $color,
        created_at: $created_at,
        x: $x,
        y: $y,
        z: $z
    })
    RETURN n
    """

    with driver.session() as session:

        result = session.run(
            cypher,
            id=neuron_id,
            user_id=user_id,
            title=payload.title,
            description=payload.description,
            type=payload.type.value,
            why_created=payload.why_created,
            category=payload.category.value,
            tags=payload.tags,
            color=color,
            created_at=created_at,
            x=x,
            y=y,
            z=z,
        )

        record = result.single()

        if record is None:
            raise HTTPException(
                status_code=500,
                detail="Could not create neuron.",
            )

        return _row_to_neuron(record)


# ============================================================
# UPDATE NEURON
# ============================================================

@router.patch(
    "/{neuron_id}",
    response_model=Neuron,
)
def update_neuron(
    neuron_id: str,
    payload: NeuronUpdate,
    user_id: str = Depends(get_current_user_id),
):

    driver = get_driver()

    updates = payload.model_dump(
        exclude_unset=True
    )

    if (
        "category" in updates
        and updates["category"] is not None
    ):
        updates["category"] = (
            updates["category"].value
            if hasattr(
                updates["category"],
                "value",
            )
            else updates["category"]
        )

    if (
        "type" in updates
        and updates["type"] is not None
    ):
        updates["type"] = (
            updates["type"].value
            if hasattr(
                updates["type"],
                "value",
            )
            else updates["type"]
        )

    if not updates:
        raise HTTPException(
            400,
            "No fields provided to update",
        )

    set_clause = ", ".join(
        f"n.{key} = ${key}"
        for key in updates
    )

    cypher = f"""
    MATCH (n:Neuron {{
        id: $id,
        user_id: $user_id
    }})

    SET {set_clause}

    RETURN n
    """

    with driver.session() as session:

        result = session.run(
            cypher,
            id=neuron_id,
            user_id=user_id,
            **updates,
        )

        record = result.single()

        if record is None:
            raise HTTPException(
                404,
                "Neuron not found.",
            )

        return _row_to_neuron(record)


# ============================================================
# DELETE NEURON
# ============================================================

@router.delete(
    "/{neuron_id}",
    status_code=204,
)
def delete_neuron(
    neuron_id: str,
    user_id: str = Depends(get_current_user_id),
):

    driver = get_driver()

    cypher = """
    MATCH (
        n:Neuron {
            id: $id,
            user_id: $user_id
        }
    )

    DETACH DELETE n

    RETURN count(n) AS deleted
    """

    with driver.session() as session:

        result = session.run(
            cypher,
            id=neuron_id,
            user_id=user_id,
        )

        record = result.single()

        if (
            record is None
            or record["deleted"] == 0
        ):
            raise HTTPException(
                404,
                "Neuron not found.",
            )

    return None