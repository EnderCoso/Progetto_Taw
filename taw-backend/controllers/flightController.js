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
    console.log("🔥 INIZIO CREAZIONE VOLO (Configurazione Reale)");
    try {
        if (!req.user) return res.status(401).json({ message: "Non autorizzato" });

        const { 
            aircraftId, 
            departureTime, arrivalTime,
            priceEconomy, priceBusiness, priceFirst,
            departureCity, arrivalCity
        } = req.body;

        // 1. Recupera l'aereo con la sua configurazione
        const aircraft = await Aircraft.findById(aircraftId);
        if (!aircraft) return res.status(404).json({ message: "Aereo non trovato" });

        let finalSeats = [];
        const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, aircraft.seatsPerRow);

        // 2. Contatori per riempire l'aereo (usiamo copie dei valori per scalarli)
        let seatsLeftFirst = aircraft.capacityFirst;
        let seatsLeftBusiness = aircraft.capacityBusiness;
        // Non serve contare economy, tutto il resto sarà economy

        console.log(`🔧 Genero mappa per ${aircraft.model}: F:${seatsLeftFirst} | B:${seatsLeftBusiness} | E:Resto`);

        // 3. Ciclo per riempire le file
        for (let r = 1; r <= aircraft.rows; r++) {
            for (let letter of colLetters) {
                let seatType = 'economy';
                let seatPrice = parseFloat(priceEconomy);

                // Logica a riempimento:
                // Se ci sono ancora posti First da piazzare, mettili qui
                if (seatsLeftFirst > 0) {
                    seatType = 'first';
                    seatPrice = parseFloat(priceFirst);
                    seatsLeftFirst--; // Ne ho piazzato uno
                } 
                // Altrimenti, se ci sono posti Business, mettili qui
                else if (seatsLeftBusiness > 0) {
                    seatType = 'business';
                    seatPrice = parseFloat(priceBusiness);
                    seatsLeftBusiness--; // Ne ho piazzato uno
                }
                // Altrimenti resta Economy (default)

                finalSeats.push({ 
                    number: `${r}${letter}`, 
                    type: seatType, 
                    price: seatPrice, 
                    isOccupied: false 
                });
            }
        }

        // 4. Salva il volo
        const flight = new Flight({
            ...req.body,
            airline: req.user._id,
            aircraft: aircraft._id,
            seats: finalSeats,
            departureAirport: req.body.departureAirport || departureCity,
            arrivalAirport: req.body.arrivalAirport || arrivalCity
        });

        const createdFlight = await flight.save();
        console.log("✅ Volo creato con configurazione aereo corretta:", createdFlight.flightCode);
        res.status(201).json(createdFlight);

    } catch (error) {
        console.error("❌ ERRORE:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Statistiche per la Compagnia
// @route   GET /api/flights/stats
exports.getAirlineStats = async (req, res) => {
    try {
        const myFlights = await Flight.find({ airline: req.user._id });
        
        if (!myFlights.length) {
            return res.json({ totalRevenue: 0, totalPassengers: 0, flightCount: 0 });
        }

        const flightIds = myFlights.map(f => f._id);
        const tickets = await Ticket.find({ flight: { $in: flightIds } });

        const totalRevenue = tickets.reduce((acc, ticket) => acc + ticket.totalPrice, 0);
        const totalPassengers = tickets.length;

        res.json({
            flightCount: myFlights.length,
            totalPassengers,
            totalRevenue,
            flights: myFlights.map(f => {
                const flightTickets = tickets.filter(t => t.flight.toString() === f._id.toString());
                const revenue = flightTickets.reduce((acc, t) => acc + t.totalPrice, 0);
                return {
                    flightCode: f.flightCode,
                    route: `${f.departureCity} - ${f.arrivalCity}`,
                    revenue,
                    passengers: flightTickets.length,
                    occupancy: f.seats ? Math.round((flightTickets.length / f.seats.length) * 100) + '%' : 'N/A'
                };
            })
        });

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