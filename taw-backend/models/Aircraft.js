const mongoose = require('mongoose');

const aircraftSchema = new mongoose.Schema({
    model: { type: String, required: true },
    
    // Configurazione Fisica
    rows: { type: Number, required: true },       // Quante file totali ha l'aereo
    seatsPerRow: { type: Number, required: true }, // Quanti sedili per fila (es. 6 = ABC DEF)
    
    // Configurazione Classi (Quanti posti per ogni tipo)
    capacityFirst: { type: Number, default: 0 },
    capacityBusiness: { type: Number, default: 0 },
    capacityEconomy: { type: Number, required: true } // Il resto è economy
});

// Virtual per il totale (calcolato al volo)
aircraftSchema.virtual('totalSeats').get(function() {
    return this.capacityFirst + this.capacityBusiness + this.capacityEconomy;
});

module.exports = mongoose.model('Aircraft', aircraftSchema);