const express = require('express');
const cors = require('cors');
const connectDB = require('./database');
const seedData = require('./seed');
const flightRoutes = require('./routes/flightRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);

// Connessione al DB e Avvio Server
const startServer = async () => {
    try {
        await connectDB();
        
        // Eseguiamo il seeding (Attenzione: in produzione questo andrebbe gestito diversamente, 
        // ma per il progetto va benissimo farlo all'avvio)
        await seedData(); 

        app.listen(PORT, () => {
            console.log(`Server attivo sulla porta ${PORT}`);
        });
    } catch (error) {
        console.error("Errore critico all'avvio:", error);
    }
};

startServer();

// Rotta di test rapida
app.get('/api/test', async (req, res) => {
    const User = require('./models/User');
    const users = await User.find({}, 'email role'); // Restituisce solo email e ruolo
    res.json({ message: "Backend funzionante!", usersFound: users });
});