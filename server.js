const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Express server is running' });
});

app.get('/health', (req, res) => res.sendStatus(200));

// Example POST endpoint
app.post('/echo', (req, res) => {
  res.json({ received: req.body });
});

// In-memory store for locations
const locations = [];
let nextLocationId = 1;

function validateLocation(body) {
  const { userId, lat, lng, timestamp } = body;
  if (typeof userId !== 'string' || typeof lat !== 'number' || typeof lng !== 'number') {
    return false;
  }
  if (timestamp && isNaN(Date.parse(timestamp))) return false;
  return true;
}

function validateLocationPartial(body) {
  if (!body || Object.keys(body).length === 0) return false;
  if (body.userId !== undefined && typeof body.userId !== 'string') return false;
  if (body.lat !== undefined && typeof body.lat !== 'number') return false;
  if (body.lng !== undefined && typeof body.lng !== 'number') return false;
  if (body.timestamp !== undefined && isNaN(Date.parse(body.timestamp))) return false;
  return true;
}

function validateLocationBody(req, res, next) {
  if (!validateLocation(req.body)) {
    return res.status(400).json({ error: 'Invalid payload. Required: userId:string, lat:number, lng:number, optional: timestamp (ISO string)' });
  }
  next();
}

function validateLocationPartialBody(req, res, next) {
  if (!validateLocationPartial(req.body)) {
    return res.status(400).json({ error: 'Invalid payload for update. Provide at least one valid field: userId (string), lat (number), lng (number), timestamp (ISO string)' });
  }
  next();
}

// List all locations
app.get('/locations', (req, res) => {
  res.json(locations);
});

// Create a location
app.post('/locations', validateLocationBody, (req, res) => {
  const data = req.body;
  const location = {
    id: String(nextLocationId++),
    userId: data.userId,
    lat: data.lat,
    lng: data.lng,
    timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  locations.push(location);
  res.status(201).json(location);
});

// Get a location by id
app.get('/locations/:id', (req, res) => {
  const loc = locations.find(l => l.id === req.params.id);
  if (!loc) return res.sendStatus(404);
  res.json(loc);
});

// Update a location by id
app.put('/locations/:id', validateLocationPartialBody, (req, res) => {
  const loc = locations.find(l => l.id === req.params.id);
  if (!loc) return res.sendStatus(404);
  const data = req.body;
  loc.lat = data.lat !== undefined ? data.lat : loc.lat;
  loc.lng = data.lng !== undefined ? data.lng : loc.lng;
  loc.userId = data.userId !== undefined ? data.userId : loc.userId;
  loc.timestamp = data.timestamp ? new Date(data.timestamp).toISOString() : loc.timestamp;
  res.json(loc);
});

// Delete a location by id
app.delete('/locations/:id', (req, res) => {
  const idx = locations.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.sendStatus(404);
  locations.splice(idx, 1);
  res.sendStatus(204);
});

// List locations for a user
app.get('/users/:userId/locations', (req, res) => {
  const userLocs = locations.filter(l => l.userId === req.params.userId);
  res.json(userLocs);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
