# Development Log

The Digital Brain project was started as a 3D knowledge graph where ideas are represented as neurons and relationships between ideas are represented as connections. I started building the frontend using React, TypeScript, Vite, Tailwind CSS, Three.js and React Three Fiber, along with a FastAPI backend and Neo4j Aura database. The initial goal was to create, edit and delete neurons, connect related neurons, add categories, search and filter ideas, and store the data permanently.

---

I set up the Neo4j Aura database and connected it to the FastAPI backend. The backend initially failed to connect because the Neo4j connection URI was not configured correctly. I found the correct database URI from Neo4j Aura and updated the backend environment variables. After correcting the configuration, the backend was able to connect to the database.

---

I continued building the neuron and connection APIs and tested them using FastAPI Swagger. While creating a neuron, I received a `422 Unprocessable Entity` error because I used a category that was not allowed by the backend model. The API only accepted the defined categories such as Projects, Learning, Research, Personal and Important. I corrected the category and successfully created neurons through the API.

---

I connected the React frontend to the FastAPI backend and implemented the main Digital Brain interactions. Neurons could be created, edited and deleted, and connections could be created and deleted. I also added search and category filtering. The data was successfully stored in Neo4j and remained available after refreshing the application.

---

I worked on the 3D interaction system. I implemented neuron selection, the neuron information panel, connection mode, connection selection and connection deletion. I also worked on the interaction between the 3D scene, neurons and connection lines and fixed several frontend interaction issues during development.

---

I added authentication to the Digital Brain. I created registration and login endpoints using FastAPI and JWT and added login and registration pages to the React frontend. I also added routes for the landing page, login page, brain, timeline and insights.

---

After adding authentication, the brain stopped loading and the API returned `403 Forbidden` with `{"detail":"Not authenticated"}` when requesting `/api/neurons`. I traced the problem to the frontend not correctly sending the JWT token with authenticated requests. I updated the API client to retrieve the token from local storage and include it in the `Authorization: Bearer` header. After this correction, authenticated users could access their neurons again.

---

I worked on the authentication flow and routing. The login page was accessible through `/login`, while the root page initially had routing problems. I checked the React Router configuration and the landing page and corrected the routes. I created a test account, successfully logged in and confirmed that the previously created neurons were available to the authenticated user. I also added logout functionality to remove the authentication token and redirect the user out of the brain.

---

While running the application, Neo4j produced connection errors such as `Failed to write data to connection` and errors involving the Neo4j Aura server on port `7687`. Some API requests were still returning `200 OK`, so I identified the issue as a database connection problem rather than the FastAPI server itself. I checked the Neo4j connection configuration and restarted the backend while testing the connection.

---

The browser console showed a React warning that `onPointerMissed` was an unknown event handler property. I found that the event was being attached to a normal HTML `div` even though it is a React Three Fiber event. I identified and corrected the event-handling issue.

---

I prepared the backend for deployment on Render. The first deployment failed because Render automatically selected Python 3.14.3 and the pinned Pydantic dependency could not build correctly. The build failed while installing `pydantic-core` and produced Rust and `maturin` errors. I changed the Render Python environment to Python 3.12, which allowed the dependencies to install correctly.

---

After fixing the Python version, the Render deployment failed with `ModuleNotFoundError: No module named 'jose'`. The authentication code imported `JWTError` and `jwt`, but the required JWT dependency was missing from `requirements.txt`. I added the missing package and redeployed the backend.

---

The next Render deployment failed because `email-validator` was not installed. The authentication models used Pydantic's `EmailStr`, which requires the email validation package. I added the missing dependency and redeployed the application successfully.

---

The FastAPI backend was successfully deployed on Render. I then started preparing the React frontend as a Render static site and configured it to communicate with the deployed backend instead of the local FastAPI server.

---

I committed the authentication and stabilization work to GitHub with the commit `3f2c6c7 Add authentication and stabilize digital brain` and pushed the changes to the main branch. The project was moved from local development toward real-world testing.

---

The Digital Brain MVP reached a working state with authentication, persistent Neo4j storage, neurons, connections, search, filtering, the 3D brain and the initial Timeline and Insights pages. The next step was to deploy the frontend and give the application to a friend for testing so that real feedback could be collected before making further changes.
