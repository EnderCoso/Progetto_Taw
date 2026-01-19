const Flight = require('../models/Flight');
const Aircraft = require('../models/Aircraft');
const Ticket = require('../models/Ticket');

// @desc    Cerca voli (Pubblico)
// @route   GET /api/flights/
exports.searchFlights = async (req, res) => {
    try {
        const { from, to, date } = req.query;
        let query = {};

        // Filtri di ricerca
        if (from) query.$or = [{ departureAirport: new RegExp(from, 'i') }, { departureCity: new RegExp(from, 'i') }];
        if (to) query.$or = [{ arrivalAirport: new RegExp(to, 'i') }, { arrivalCity: new RegExp(to, 'i') }];

        // Se c'è date, cerca in quel giorno
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            query.departureTime = { $gte: start, $lt: end };
        }

        const flights = await Flight.find(query)
            .populate('aircraft', 'model')
            .populate('airline', 'airlineName');

        res.json(flights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crea volo (Privato)
// @route   POST /api/flights
exports.createFlight = async (req, res) => {
    try {
        const { aircraftId, ticketCost, ...flightData } = req.body;
        const aircraft = await Aircraft.findById(aircraftId);
        
        if (!aircraft) return res.status(404).json({ message: 'Aereo non trovato' });

        const newFlight = new Flight({
            ...flightData,
            aircraft: aircraftId,
            // Usa i posti dell'aereo come disponibilità iniziale
            availableSeats: {
                economy: aircraft.seats.economy,
                business: aircraft.seats.business,
                first: aircraft.seats.first
            },
            ticketCost: ticketCost // Assicurati che dal frontend arrivi un oggetto { economy: ..., business: ... }
        });

        await newFlight.save();
        res.status(201).json(newFlight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAircrafts = async (req, res) => {
    try {
        const aircrafts = await Aircraft.find();
        res.json(aircrafts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}