const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// In-memory location data storage
let locations = [];
let locationId = 1;

// POST API for adding a new location
app.post('/api/store-location', (req, res) => {
  const { latitude, longitude, street, area, town, city, state, country, postalCode, fullAddress } = req.body;

  // Validate the input data
  if (!latitude || !longitude || !street || !area || !town || !city || !state || !country || !postalCode || !fullAddress) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Create a new location object with an incremented ID
  const newLocation = {
    id: locationId++,
    latitude,
    longitude,
    street,
    area,
    town,
    city,
    state,
    country,
    postalCode,
    fullAddress,
  };

  // Store the location in memory
  locations.push(newLocation);

  // Send the response
  res.status(201).json({
    message: 'Location stored successfully',
    location: newLocation,
  });
});

// GET API to fetch all stored locations
app.get('/api/locations', (req, res) => {
  res.status(200).json({
    locations: locations,
    count: locations.length,
  });
});

app.delete('/api/delete-locations', (req, res) => {
  locations = []; // Clear the locations array
  res.json({ message: 'All locations have been deleted.' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
