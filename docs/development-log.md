\# Digital Brain — Development Log



> A chronological record of the design decisions, implementation steps, problems encountered, solutions, and milestones during the development of Digital Brain.



\---



\# 1. Project Overview



\## What is Digital Brain?



Digital Brain is a 3D knowledge management system designed to represent ideas visually as a network of interconnected neurons.



Instead of storing ideas as a traditional list of notes, the system represents each idea as a \*\*neuron\*\* and relationships between ideas as \*\*synapses\*\*.



For example:



```text

&#x20;                   Artificial Intelligence

&#x20;                          │

&#x20;             ┌────────────┴────────────┐

&#x20;             │                         │

&#x20;          Python                    Machine Learning

&#x20;             │                         │

&#x20;             │                      Neural Networks

&#x20;             │                         │

&#x20;            ROS2 ─────────────── Robotics

```



The objective is to make relationships between ideas visible rather than hiding them inside folders, documents, or disconnected notes.



As more ideas are added and connected, the knowledge graph should gradually become a personal \*\*3D digital brain\*\*.



\---



\# 2. Project Motivation



Traditional note-taking systems primarily organize information using:



\* Folders

\* Documents

\* Categories

\* Tags

\* Search



These approaches are useful, but they do not naturally represent the relationships between ideas.



Digital Brain explores a different approach:



> \*\*What if ideas were represented as neurons and relationships between ideas were represented as synapses?\*\*



The project therefore combines:



\* Knowledge graphs

\* 3D visualization

\* Graph databases

\* Web development

\* Interactive user interfaces



The long-term goal is to create a system where the structure of knowledge becomes visually observable.



\---



\# 3. Initial Project Goals



The first version focuses on building a reliable foundation rather than immediately adding artificial intelligence.



The initial version aims to support:



\### 3.1 Neurons



Each neuron represents an idea.



A neuron can contain:



\* Title

\* Description

\* Category

\* Tags

\* 3D position

\* Unique identifier



Example:



```text

Title: Kalman Filter



Description:

An algorithm used for estimating the state of a system

from noisy measurements.



Category:

Robotics



Tags:

IMU, estimation, sensor fusion

```



\---



\### 3.2 Synapses



A synapse represents a relationship between two neurons.



For example:



```text

MPU6050 ─────→ Sensor Fusion

&#x20;                 │

&#x20;                 ↓

&#x20;            Kalman Filter

```



The relationship itself is stored in Neo4j.



\---



\### 3.3 3D Visualization



The knowledge graph is rendered as a 3D environment.



Conceptually:



```text

&#x20;            ● Python

&#x20;           / \\

&#x20;          /   \\

&#x20;         ●     ● Machine Learning

&#x20;          \\   /

&#x20;           \\ /

&#x20;            ● AI

```



The user can rotate, zoom, and navigate through the brain.



\---



\### 3.4 Persistence



The brain should not disappear when the browser is closed.



Neuron and relationship data are stored in \*\*Neo4j Aura\*\*, a cloud-hosted graph database.



Therefore:



```text

Browser closed

&#x20;     ↓

Data remains in Neo4j

&#x20;     ↓

Website reopened

&#x20;     ↓

Brain reconstructed

```



\---



\# 4. Technology Selection



\## 4.1 Frontend — React



React is used to build the interactive web interface.



It manages:



\* Pages

\* Components

\* Forms

\* UI state

\* User interactions



\---



\## 4.2 TypeScript



TypeScript is used instead of plain JavaScript to provide static typing.



This helps reduce errors when working with structured data such as:



```text

Neuron

Connection

Category

API Response

```



\---



\## 4.3 Vite



Vite provides the development environment and build system for the React application.



It allows the frontend to run locally with:



```text

localhost:5173

```



\---



\## 4.4 Tailwind CSS



Tailwind CSS is used for styling the interface.



It allows UI components such as:



\* Buttons

\* Panels

\* Search bars

\* Modals

\* Navigation elements



to be styled efficiently.



\---



\## 4.5 React Three Fiber + Three.js



Three.js provides the underlying 3D rendering capabilities.



React Three Fiber allows Three.js scenes to be integrated naturally into React.



This is responsible for the visual brain.



The architecture is conceptually:



```text

React

&#x20; │

&#x20; └── React Three Fiber

&#x20;         │

&#x20;         └── Three.js

&#x20;                 │

&#x20;                 ├── Neurons

&#x20;                 ├── Synapses

&#x20;                 ├── Camera

&#x20;                 ├── Lighting

&#x20;                 └── 3D Environment

```



\---



\# 5. Backend Architecture



\## FastAPI



FastAPI provides the backend REST API.



The frontend does not communicate directly with Neo4j.



Instead:



```text

React

&#x20; │

&#x20; │ HTTP request

&#x20; ▼

FastAPI

&#x20; │

&#x20; │ Neo4j Driver

&#x20; ▼

Neo4j Aura

```



This separation provides a cleaner architecture and allows the database layer to remain hidden from the browser.



\---



\# 6. Database — Neo4j



Neo4j was selected because Digital Brain is fundamentally a \*\*graph problem\*\*.



Traditional relational databases represent information primarily using tables.



Digital Brain instead needs to represent:



```text

Idea → related to → Idea

```



Neo4j naturally represents this using:



```text

(Node)-\[Relationship]->(Node)

```



For Digital Brain:



```text

(Neuron)-\[CONNECTED\_TO]->(Neuron)

```



For example:



```text

(Python)-\[RELATED\_TO]->(Machine Learning)

```



This makes Neo4j particularly suitable for storing the structure of the brain.



\---



\# 7. Initial Project Architecture



The application currently follows this architecture:



```text

┌─────────────────────────────┐

│        Web Browser          │

│                             │

│ React + TypeScript          │

│ React Three Fiber           │

│ Three.js                    │

└──────────────┬──────────────┘

&#x20;              │

&#x20;              │ HTTP / REST API

&#x20;              ▼

┌─────────────────────────────┐

│       FastAPI Backend       │

│                             │

│ API Routes                  │

│ Data Models                 │

│ Neo4j Driver                │

└──────────────┬──────────────┘

&#x20;              │

&#x20;              │ Bolt

&#x20;              ▼

┌─────────────────────────────┐

│        Neo4j Aura            │

│                             │

│ Nodes = Neurons             │

│ Relationships = Synapses    │

└─────────────────────────────┘

```



\---



\# 8. Development Environment Setup



\## Step 1 — Project Structure



The project was organized into two primary applications:



```text

digital-brain/

│

├── backend/

│

├── frontend/

│

├── README.md

│

├── .gitignore

│

└── docs/

```



The frontend and backend are intentionally separated.



\---



\# 9. Backend Environment



A Python virtual environment was created to isolate the project's Python dependencies.



The virtual environment prevents project-specific packages from interfering with other Python projects on the computer.



The backend dependencies include:



```text

FastAPI

Uvicorn

Neo4j

python-dotenv

Pydantic

```



The backend environment was successfully created and dependencies were installed.



\---



\# 10. Neo4j Setup



A Neo4j Aura instance was created to provide cloud-based graph database storage.



The database credentials are stored locally using environment variables.



The application uses:



```text

NEO4J\_URI

NEO4J\_USERNAME

NEO4J\_PASSWORD

```



These values are intentionally excluded from Git using `.gitignore`.



\### Security decision



The actual `.env` file is never committed to GitHub.



Instead, the repository contains:



```text

.env.example

```



which documents the required environment variables without exposing credentials.



\---



\# 11. Neo4j Connection Layer



The backend contains a dedicated database module:



```text

backend/app/database.py

```



This module creates and manages a single Neo4j driver.



The driver is reused throughout the application rather than creating a new database connection for every request.



Conceptually:



```text

Application Startup

&#x20;      ↓

Create Neo4j Driver

&#x20;      ↓

Verify Connectivity

&#x20;      ↓

Application Running

&#x20;      ↓

Reuse Driver

&#x20;      ↓

Application Shutdown

&#x20;      ↓

Close Driver

```



This approach allows the Neo4j driver to manage its internal connection pool efficiently.



\---



\# 12. Backend Verification



After configuring Neo4j, the FastAPI server was started using:



```text

uvicorn app.main:app --reload --port 8000

```



The application successfully reported:



```text

Application startup complete.

```



The health endpoint was then accessed through:



```text

/api/health

```



The server returned:



```json

{

&#x20; "status": "ok"

}

```



The HTTP status was:



```text

200 OK

```



This confirmed that:



1\. FastAPI was running.

2\. The application started successfully.

3\. The backend was reachable.

4\. The Neo4j connectivity check succeeded.



\---



\# 13. Problem Encountered — Neo4j Connection



During initial setup, the backend failed to start because the Neo4j hostname could not be resolved.



The error was:



```text

ValueError: Cannot resolve address ...databases.neo4j.io:7687

```



\### Investigation



The Python code itself was functioning correctly.



The issue was traced to the Neo4j connection URI in the environment configuration.



\### Resolution



The exact connection URI provided by the Neo4j Aura instance was obtained and placed into:



```text

backend/.env

```



After restarting FastAPI, the application successfully connected to Neo4j.



\### Lesson



When connecting to a managed database service, the connection URI should be copied directly from the provider rather than manually reconstructed.



\---



\# 14. Frontend Environment



The frontend requires Node.js and npm.



Node.js was installed using the Windows installer.



The frontend dependencies were then installed using:



```text

npm install

```



The application was started using:



```text

npm run dev

```



Vite successfully started the development server.



The frontend became available at:



```text

http://localhost:5173

```



\---



\# 15. First Successful Full-Stack Run



The first complete local architecture was successfully established:



```text

Browser

&#x20;  │

&#x20;  ▼

React / Vite

localhost:5173

&#x20;  │

&#x20;  ▼

FastAPI

localhost:8000

&#x20;  │

&#x20;  ▼

Neo4j Aura

```



The Digital Brain landing page successfully loaded in the browser.



This marked the completion of the initial environment and infrastructure setup.



\---



\# 16. Git and GitHub Setup



Git was initialized in the project root.



A `.gitignore` file was configured to prevent sensitive and unnecessary files from being committed.



Important ignored files include:



```text

.env

backend/.env

backend/venv/

backend/.venv/

frontend/node\_modules/

frontend/dist/

\_\_pycache\_\_/

```



The repository was then connected to GitHub.



The initial project state was committed using:



```text

Initial Digital Brain project setup

```



The project was pushed to the GitHub repository.



\---



\# 17. Documentation Strategy



Documentation is maintained inside the same repository as the source code.



The planned documentation structure is:



```text

docs/

│

├── development-log.md

├── architecture.md

├── setup.md

└── roadmap.md

```



\### Why one repository?



Keeping code and documentation together provides a single source of truth.



Anyone viewing the GitHub repository can understand:



```text

What the project is

&#x20;      ↓

How it works

&#x20;      ↓

How to run it

&#x20;      ↓

How it was developed

&#x20;      ↓

What is planned next

```



\---



\# 18. Current Project Status



| Component               | Status            |

| ----------------------- | ----------------- |

| Project structure       | ✅ Complete        |

| Git repository          | ✅ Complete        |

| GitHub repository       | ✅ Complete        |

| `.gitignore`            | ✅ Complete        |

| Python environment      | ✅ Complete        |

| Backend dependencies    | ✅ Complete        |

| Neo4j Aura              | ✅ Running         |

| Neo4j connection        | ✅ Working         |

| FastAPI backend         | ✅ Working         |

| Node.js                 | ✅ Installed       |

| Frontend dependencies   | ✅ Installed       |

| React/Vite frontend     | ✅ Working         |

| Landing page            | ✅ Working         |

| Neuron creation         | 🚧 Next           |

| Persistent neurons      | 🚧 Next           |

| Synapse creation        | 🚧 Planned        |

| 3D brain interaction    | 🚧 In Development |

| Search and filtering    | 🚧 Planned        |

| AI-assisted connections | 🔮 Future         |



\---



\# 19. Next Development Milestone



The next milestone is to test and understand the existing neuron workflow.



The target flow is:



```text

User clicks "+"

&#x20;      ↓

Create Neuron form

&#x20;      ↓

User enters idea

&#x20;      ↓

Frontend sends POST request

&#x20;      ↓

FastAPI receives request

&#x20;      ↓

Backend validates data

&#x20;      ↓

Neo4j stores neuron

&#x20;      ↓

Backend returns neuron

&#x20;      ↓

Frontend updates 3D scene

&#x20;      ↓

New neuron appears

```



The first successful neuron will represent the transition from:



> \*\*Project infrastructure\*\*



to:



> \*\*Functional Digital Brain\*\*



\---



\# 20. Long-Term Vision



The initial version is intentionally simple.



Future versions may introduce:



\### Intelligent Connections



The system could analyze new ideas and suggest relationships automatically.



```text

New idea

&#x20;  ↓

Semantic analysis

&#x20;  ↓

Find related neurons

&#x20;  ↓

Suggest connections

&#x20;  ↓

User approves

&#x20;  ↓

Brain evolves

```



\### Semantic Search



Instead of searching only exact words, users could search by meaning.



\### Automatic Clustering



Related areas of knowledge could naturally form visual clusters.



\### Brain Evolution



The graph could change its visual structure as knowledge grows.



\### AI Integration



An AI layer could eventually help:



\* Summarize neurons

\* Suggest connections

\* Detect duplicate ideas

\* Find knowledge gaps

\* Generate learning paths

\* Explain relationships between concepts



These features are future goals and are \*\*not part of the current implementation\*\*.



\---



\# 21. Development Philosophy



Digital Brain is being developed incrementally.



Each major feature follows this cycle:



```text

Idea

&#x20;↓

Design

&#x20;↓

Implementation

&#x20;↓

Local Testing

&#x20;↓

Documentation

&#x20;↓

Git Commit

&#x20;↓

GitHub

```



The purpose of this process is not only to build the application, but also to maintain a transparent engineering record showing how the project evolves over time.



\---



\# 22. Milestone History



| Milestone                          | Status |

| ---------------------------------- | ------ |

| Initial project structure          | ✅      |

| Backend environment                | ✅      |

| Neo4j database                     | ✅      |

| Backend–database connection        | ✅      |

| Frontend environment               | ✅      |

| First landing page                 | ✅      |

| Git repository                     | ✅      |

| GitHub repository                  | ✅      |

| Detailed development documentation | 🔄     |

| First neuron                       | ⏳      |

| First persistent connection        | ⏳      |

| Interactive 3D graph               | ⏳      |

| Intelligent connections            | 🔮     |



\---



\## Current Milestone



\*\*Milestone 0 — Infrastructure Complete\*\*



The foundation required to develop the Digital Brain is now operational.



The next milestone is:



\*\*Milestone 1 — First Neuron\*\*



> Create an idea → store it in Neo4j → retrieve it through the API → render it as a neuron in the 3D environment.



