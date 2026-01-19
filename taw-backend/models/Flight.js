const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flightNumber: { type: String, required: true },
    departureAirport: { type: String, required: true },
    arrivalAirport: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    
    // Prezzi per classe
    ticketCost: {
        economy: { type: Number, required: true },
        business: { type: Number },
        first: { type: Number }
    },
    
    // Disponibilità per classe
    availableSeats: {
        economy: { type: Number, default: 0 },
        business: { type: Number, default: 0 },
        first: { type: Number, default: 0 }
    },

    aircraft: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Aircraft',
        required: true 
    }
});

module.exports = mongoose.model('Flight', flightSchema);