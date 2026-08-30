from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from ..database import get_driver
from ..models import Connection, ConnectionCreate

router = APIRouter(prefix="/api/connections", tags=["connections"])


@router.get("", response_model=list[Connection])
def list_connections():
    driver = get_driver()

    cypher = """
    MATCH (a:Neuron)-[r:CONNECTED_TO]->(b:Neuron)
    RETURN
        a.id AS source_id,
        b.id AS target_id,
        coalesce(r.created_at, a.created_at) AS created_at
    """

    with driver.session() as session:
        result = session.run(cypher)

        return [
            Connection(
                source_id=r["source_id"],
                target_id=r["target_id"],
                created_at=r["created_at"],
            )
            for r in result
        ]


@router.post("", response_model=Connection, status_code=201)
def create_connection(payload: ConnectionCreate):
    if payload.source_id == payload.target_id:
        raise HTTPException(
            400,
            "A neuron can't connect to itself",
        )

    driver = get_driver()

    created_at = datetime.now(timezone.utc).isoformat()

    cypher = """
    MATCH (a:Neuron {id: $source_id}),
          (b:Neuron {id: $target_id})

    MERGE (a)-[r:CONNECTED_TO]->(b)

    ON CREATE SET r.created_at = $created_at

    RETURN
        a.id AS source_id,
        b.id AS target_id,
        r.created_at AS created_at
    """

    with driver.session() as session:
        result = session.run(
            cypher,
            source_id=payload.source_id,
            target_id=payload.target_id,
            created_at=created_at,
        )

        record = result.single()

        if record is None:
            raise HTTPException(
                404,
                "One or both neurons not found",
            )

        return Connection(
            source_id=record["source_id"],
            target_id=record["target_id"],
            created_at=record["created_at"],
        )


@router.delete("", status_code=204)
def delete_connection(
    source_id: str,
    target_id: str,
):
    driver = get_driver()

    cypher = """
    MATCH (a:Neuron {id: $source_id})
          -[r:CONNECTED_TO]->
          (b:Neuron {id: $target_id})

    DELETE r

    RETURN count(r) AS deleted
    """

    with driver.session() as session:
        result = session.run(
            cypher,
            source_id=source_id,
            target_id=target_id,
        )

        record = result.single()

        if record is None or record["deleted"] == 0:
            raise HTTPException(
                404,
                "Connection not found",
            )

    return None