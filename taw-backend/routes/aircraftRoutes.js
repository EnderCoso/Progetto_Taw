const express = require('express');
const router = express.Router();
const { createAircraft, getAircrafts } = require('../controllers/aircraftController');
const { protect } = require('../middleware/authMiddleware'); // Assicurati che il middleware esista

// Rotta per ottenere tutti gli aerei (pubblica o protetta a scelta)
router.get('/', protect, getAircrafts);

// Rotta per creare un aereo (solo utenti loggati)
router.post('/', protect, createAircraft);

module.exports = router;