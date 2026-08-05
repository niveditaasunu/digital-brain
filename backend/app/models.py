from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class Category(str, Enum):
    projects = "Projects"
    learning = "Learning"
    research = "Research"
    personal = "Personal"
    important = "Important"


CATEGORY_COLORS: dict[str, str] = {
    "Projects": "#22c55e",   # green
    "Learning": "#3b82f6",   # blue
    "Research": "#a855f7",   # purple
    "Personal": "#f97316",   # orange
    "Important": "#ef4444",  # red
}


class NeuronCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    description: str = Field("", max_length=2000)
    category: Category
    tags: list[str] = Field(default_factory=list)
    color: Optional[str] = None  # falls back to category color if omitted


class NeuronUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=2000)
    category: Optional[Category] = None
    tags: Optional[list[str]] = None
    color: Optional[str] = None


class Neuron(BaseModel):
    id: str
    title: str
    description: str
    category: str
    tags: list[str]
    color: str
    created_at: str
    # Position is generated once on the frontend and persisted so the
    # brain layout doesn't reshuffle every time you reload the page.
    x: float
    y: float
    z: float


class ConnectionCreate(BaseModel):
    source_id: str
    target_id: str


class Connection(BaseModel):
    source_id: str
    target_id: str
