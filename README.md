# Digital Brain

A personal space where you can store your ideas and see how they are connected.

Digital Brain represents each idea as a neuron and each relationship between ideas as a connection. The goal is to help you see your knowledge as a connected system instead of a collection of separate notes.

## Live Demo

Website: https://digital-brain-sxki.onrender.com

Backend: https://digital-brain-backend-w16g.onrender.com

The project is currently in the early testing stage.

## What You Can Do

* Create your own account
* Create and manage ideas
* Add descriptions, categories, tags and types to ideas
* Connect related ideas
* Explore your ideas in a 3D view
* Search through your ideas
* Filter ideas by category
* View how your brain develops over time
* View basic information about your knowledge graph

## How It Works

Each idea is stored as a neuron.

When two ideas are related, they can be connected.

For example:

```text
Python
   |
   | related to
   |
Machine Learning
   |
   | used in
   |
Artificial Intelligence
```

As you add more ideas and connections, your personal knowledge graph grows.

## Technology

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Three.js
* React Three Fiber

### Backend

* Python
* FastAPI
* Uvicorn
* JWT authentication

### Database

* Neo4j

### Deployment

* GitHub
* Render
* Neo4j Aura

## Project Structure

```text
digital-brain/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── neurons.py
│   │   │   └── connections.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── App.tsx
│   │   └── types.ts
│   │
│   └── package.json
│
└── README.md
```

## Current Status

Digital Brain is currently a working MVP.

The first version has been deployed and is being tested with early users. The next features and changes will be based on feedback from these users.

## What's Next

Some of the ideas being explored for future versions include:

* Making it faster and easier to add ideas
* Automatically finding connections between ideas
* An AI feature that can answer questions using your own brain
* Better ways to understand how your knowledge changes over time
* Shareable views of your brain

These features are not part of the current version yet.

## Why I Built This

Most tools are designed to store notes.

I wanted to experiment with a different idea: what if your knowledge could be represented as a living network of ideas and relationships?

Digital Brain is an attempt to explore that idea.

## Built By

Niveditaa Sunu

B.Tech Computer Science Engineering

## License

MIT License
