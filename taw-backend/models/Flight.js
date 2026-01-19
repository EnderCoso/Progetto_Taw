const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    number: { type: String, required: true }, // Es: "1A", "12F"
    type: { 
        type: String, 
        enum: ['economy', 'business', 'first'], 
        default: 'economy' 
    },
    price: { type: Number, required: true }, // Prezzo specifico per questo sedile
    isOccupied: { type: Boolean, default: false },
    occupiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // Opzionale, per sapere chi l'ha preso
});

const flightSchema = new mongoose.Schema({
    flightCode: { type: String, required: true, unique: true }, // Es: AZ2024
    
    airline: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    aircraft: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Aircraft', 
        required: false 
    },

    // Rotta (Città e Aeroporti)
    departureAirport: { type: String, required: false }, // Codice IATA o nome città
    departureCity: { type: String, required: true },
    arrivalAirport: { type: String, required: false },
    arrivalCity: { type: String, required: true },

    // Orari
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    duration: { type: Number }, // In minuti, calcolato o inserito

    // Prezzi base (per riferimento rapido nella ricerca)
    basePrices: {
        economy: Number,
        business: Number,
        first: Number
    },

    // L'array dei posti vive QUI dentro!
    seats: [seatSchema],

    status: { 
        type: String, 
        enum: ['scheduled', 'delayed', 'cancelled', 'landed'], 
        default: 'scheduled' 
    }
});

// Indici per velocizzare la ricerca (fondamentale per le performance!)
flightSchema.index({ departureCity: 1, arrivalCity: 1, departureTime: 1 });

module.exports = mongoose.model('Flight', flightSchema);