const express = require('express');
const router = express.Router();
const { bookFlight, getMyTickets } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Tutte le rotte qui sotto richiedono il login
router.post('/', protect, bookFlight);
router.get('/my-tickets', protect, getMyTickets);

module.exports = router;