const mongoose = require('mongoose');

const aircraftSchema = new mongoose.Schema({
    model: { 
        type: String, 
        required: true 
    },
    // Nuova struttura: posti divisi per classe
    seats: {
        economy: { type: Number, required: true, default: 0 },
        business: { type: Number, required: true, default: 0 },
        first: { type: Number, required: true, default: 0 }
    },
    totalSeats: { type: Number } // Campo calcolato o mantenuto per compatibilità
});

// Opzionale: calcola il totale automaticamente prima di salvare
aircraftSchema.pre('save', function(next) {
    this.totalSeats = (this.seats.economy || 0) + (this.seats.business || 0) + (this.seats.first || 0);
    next();
});

module.exports = mongoose.model('Aircraft', aircraftSchema);