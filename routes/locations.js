const express = require('express');
const router = express.Router();
const { LOCATIONS } = require('../data/locations');

// GET /api/locations - Get all standard curated locations
router.get('/', (req, res) => {
  const { search } = req.query;
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    const filtered = LOCATIONS.filter(loc => loc.toLowerCase().includes(q));
    return res.json({ success: true, count: filtered.length, locations: filtered });
  }
  res.json({ success: true, count: LOCATIONS.length, locations: LOCATIONS });
});

module.exports = router;
