const Aircraft = require('../models/Aircraft');

exports.createAircraft = async (req, res) => {
    try {
        // Verifica che l'utente sia una compagnia aerea
        if (req.user.role !== 'airline' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accesso negato. Solo le compagnie aeree possono aggiungere aerei.' });
        }

        const { model, seats, registrationNumber } = req.body;

        // Validazione base
        if (!model || !seats || !seats.economy) {
            return res.status(400).json({ message: 'Modello e posti in Economy sono obbligatori.' });
        }

        const newAircraft = new Aircraft({
            model,
            seats: {
                economy: seats.economy,
                business: seats.business || 0,
                first: seats.first || 0
            },
            registrationNumber
        });

        await newAircraft.save();
        res.status(201).json({ message: 'Aereo aggiunto con successo!', aircraft: newAircraft });

    } catch (error) {
        res.status(500).json({ message: 'Errore del server', error: error.message });
    }
};

exports.getAircrafts = async (req, res) => {
    try {
        const aircrafts = await Aircraft.find();
        res.status(200).json(aircrafts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};