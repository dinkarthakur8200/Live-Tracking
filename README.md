# Live-Tracking — Express Server

Minimal Express.js server scaffold.

## Quick start

1. Install dependencies

```bash
npm install
```

2. Run server

```bash
npm start
```

For development with auto-reload (requires `nodemon`):

```bash
npm run dev
```

Endpoints:
- `GET /` — health/status
- `GET /health` — 200 OK
- `POST /echo` — echoes posted JSON

Tracking endpoints (in-memory store):
- `GET /locations` — list all locations
- `POST /locations` — create a location
  - Body JSON: `{ "userId": "<string>", "lat": <number>, "lng": <number>, "timestamp": "<ISO string (optional)>" }`
  - Example:

```bash
curl -X POST http://localhost:3000/locations \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-123","lat":37.78,"lng":-122.41}'
```

- `GET /locations/:id` — get location by id
- `PUT /locations/:id` — update location (same body as POST)
- `DELETE /locations/:id` — delete location
- `GET /users/:userId/locations` — list locations for a specific user

