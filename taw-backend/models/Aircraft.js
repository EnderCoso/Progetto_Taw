const mongoose = require('mongoose');

const aircraftSchema = new mongoose.Schema({
    model: { 
        type: String, 
        required: true 
    },
    // La tua nuova struttura per i posti
    seats: {
        economy: { type: Number, required: true, default: 0 },
        business: { type: Number, required: true, default: 0 },
        first: { type: Number, required: true, default: 0 }
    },
    totalSeats: { type: Number } 
});

// Calcolo automatico totale (opzionale ma utile)
aircraftSchema.pre('save', function(next) {
    this.totalSeats = (this.seats.economy || 0) + (this.seats.business || 0) + (this.seats.first || 0);
    next();
});

module.exports = mongoose.model('Aircraft', aircraftSchema);