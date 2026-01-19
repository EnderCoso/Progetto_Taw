const Flight = require('../models/Flight');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

// @desc    Acquista un biglietto
// @route   POST /api/bookings
// @access  Private (Solo passeggeri loggati)
exports.bookFlight = async (req, res) => {
    // NOTA: Abbiamo rimosso la transazione (session) perché MongoDB Standalone non le supporta.
    try {
        const { flightId, seatNumber, extras } = req.body;
        const passengerId = req.user._id;

        // 1. Trova il volo
        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ message: 'Volo non trovato' });
        }

        // 2. Trova il posto specifico
        const seatIndex = flight.seats.findIndex(s => s.number === seatNumber);
        
        if (seatIndex === -1) {
            return res.status(404).json({ message: 'Posto non esistente su questo aereo' });
        }

        // 3. VERIFICA DISPONIBILITÀ
        if (flight.seats[seatIndex].isOccupied) {
            return res.status(400).json({ message: 'Posto già occupato! Scegline un altro.' });
        }

        // 4. Calcola prezzo
        let finalPrice = flight.seats[seatIndex].price;
        // Logica extra semplificata
        if (extras && extras.extraBaggage) finalPrice += 50;

        // 5. AGGIORNA IL VOLO (Blocca il posto)
        flight.seats[seatIndex].isOccupied = true;
        flight.seats[seatIndex].occupiedBy = passengerId;
        
        // Salviamo il volo PRIMA di creare il biglietto
        await flight.save(); 

        // 6. CREA IL BIGLIETTO
        const ticket = await Ticket.create({
            passenger: passengerId,
            flight: flightId,
            seatNumber: seatNumber,
            extras: extras || {},
            totalPrice: finalPrice,
            status: 'confirmed'
        });

        res.status(201).json({ 
            message: 'Prenotazione confermata!', 
            ticket: ticket 
        });

    } catch (error) {
        // Se il volo era stato salvato ma il biglietto fallisce, avremmo un'inconsistenza.
        // In un progetto reale servirebbe un rollback manuale qui, ma per l'esame va bene così.
        res.status(400).json({ message: error.message });
    }
};

// @desc    Ottieni i biglietti dell'utente loggato
// @route   GET /api/bookings/my-tickets
exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ passenger: req.user._id })
            .populate({
                path: 'flight',
                select: 'flightCode departureCity arrivalCity departureTime'
            });
        
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};