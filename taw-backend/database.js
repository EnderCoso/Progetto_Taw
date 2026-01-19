// database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connesso con successo.');
    } catch (error) {
        console.error('❌ Errore connessione MongoDB:', error.message);
        process.exit(1); // Se non si connette, spegni tutto
    }
};

module.exports = connectDB;