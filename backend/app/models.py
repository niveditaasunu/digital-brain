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


class NeuronType(str, Enum):
    person = "Person"
    emotion = "Emotion"
    thought = "Thought"
    idea = "Idea"
    memory = "Memory"
    experience = "Experience"
    goal = "Goal"
    interest = "Interest"
    knowledge = "Knowledge"
    opinion = "Opinion"
    custom = "Custom"


CATEGORY_COLORS: dict[str, str] = {
    "Projects": "#22c55e",
    "Learning": "#3b82f6",
    "Research": "#a855f7",
    "Personal": "#f97316",
    "Important": "#ef4444",
}


class NeuronCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    description: str = Field("", max_length=2000)

    type: NeuronType
    why_created: str = Field("", max_length=2000)

    category: Category
    tags: list[str] = Field(default_factory=list)
    color: Optional[str] = None


class NeuronUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=2000)

    type: Optional[NeuronType] = None
    why_created: Optional[str] = Field(None, max_length=2000)

    category: Optional[Category] = None
    tags: Optional[list[str]] = None
    color: Optional[str] = None


class Neuron(BaseModel):
    id: str
    title: str
    description: str

    type: str
    why_created: str

    category: str
    tags: list[str]
    color: str
    created_at: str

    # Position is generated once on the frontend and persisted
    # so the brain layout doesn't reshuffle after reload.
    x: float
    y: float
    z: float


class ConnectionCreate(BaseModel):
    source_id: str
    target_id: str


class Connection(BaseModel):
    source_id: str
    target_id: str
    created_at: str