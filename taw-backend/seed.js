const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Nota: a volte il percorso è relativo diverso a seconda di dove lo lanci. 
// Dentro docker la root è /app, quindi ./database va bene.
const connectDB = require('./database'); 
const User = require('./models/User');
const Flight = require('./models/Flight');
const Aircraft = require('./models/Aircraft');

dotenv.config();

const seedData = async () => {
    console.log("🚀 1. Seed avviato..."); // DEBUG

    try {
        console.log("🔌 2. Connessione al DB in corso...");
        await connectDB();
        console.log("✅ 3. DB Connesso!");

        console.log("🗑️  4. Pulizia Database...");
        await User.deleteMany();
        await Flight.deleteMany();
        await Aircraft.deleteMany();

        // 1. UTENTI
        console.log("👥 5. Creazione Utenti...");
        await User.create([
            { name: 'Admin', email: 'admin@taw.it', password: 'adminpassword', role: 'admin' },
            { name: 'Alitalia', email: 'alitalia@taw.it', password: 'airlinepassword', role: 'airline' },
            { name: 'Mario', email: 'mario.rossi@taw.it', password: 'userpassword', role: 'passenger' }
        ]);

        // 2. AEREI
        console.log("✈️  6. Creazione Aerei...");
        await Aircraft.insertMany([
            { 
                model: 'Boeing 737', 
                rows: 25, seatsPerRow: 6,
                capacityFirst: 0, 
                capacityBusiness: 12,
                capacityEconomy: 138 
            },
            { 
                model: 'Airbus A320', 
                rows: 28, seatsPerRow: 6,
                capacityFirst: 12,
                capacityBusiness: 18,
                capacityEconomy: 138 
            },
            { 
                model: 'Embraer 190', 
                rows: 25, seatsPerRow: 4,
                capacityFirst: 0,
                capacityBusiness: 8,
                capacityEconomy: 92 
            }
        ]);

        console.log("🛠️  6b. Creazione Volo di Prova...");

        // 1. Recuperiamo gli ID necessari che abbiamo appena creato
        const airlineUser = await User.findOne({ email: 'alitalia@taw.it' });
        const aircraftA320 = await Aircraft.findOne({ model: 'Airbus A320' });

        if (airlineUser && aircraftA320) {
            
            // 2. Generiamo i posti manualmente (simuliamo quello che fa il controller)
            let testSeats = [];
            const colLetters = ['A', 'B', 'C', 'D', 'E', 'F']; 
            
            for (let r = 1; r <= aircraftA320.rows; r++) {
                for (let c = 0; c < aircraftA320.seatsPerRow; c++) {
                    let type = 'economy';
                    let price = 100; // Prezzo base

                    // Assegniamo le classi come nell'aereo reale
                    if (r <= 2) { 
                        type = 'first'; price = 500; 
                    } else if (r <= 5) { 
                        type = 'business'; price = 250; 
                    }

                    testSeats.push({
                        number: `${r}${colLetters[c]}`,
                        type: type,
                        price: price,
                        isOccupied: false // Tutti liberi
                    });
                }
            }

            // 3. Creiamo il volo
            // Date dinamiche: Parte domani, arriva domani + 2 ore
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(10, 0, 0, 0); // Domani alle 10:00

            const arrival = new Date(tomorrow);
            arrival.setHours(12, 0, 0, 0); // Domani alle 12:00

            await Flight.create({
                flightCode: 'TEST-001',
                airline: airlineUser._id,
                aircraft: aircraftA320._id,
                departureCity: 'Roma',
                arrivalCity: 'Milano',
                departureAirport: 'Fiumicino (FCO)',
                arrivalAirport: 'Malpensa (MXP)',
                departureTime: tomorrow,
                arrivalTime: arrival,
                basePrices: { economy: 100, business: 250, first: 500 }, // Opzionale, per riferimento
                seats: testSeats
            });
            
            console.log("✈️  Volo di prova 'Roma -> Milano' (TEST-001) inserito!");
        }
        
        console.log("🏁 7. TUTTO COMPLETATO CON SUCCESSO!");
        process.exit(); // <--- FONDAMENTALE PER USCIRE
    } catch (error) {
        console.error("❌ ERRORE CRITICO:", error);
        process.exit(1);
    }
};

// Se lanciato direttamente da riga di comando (come facciamo noi con node seed.js)
if (require.main === module) {
    seedData();
}

module.exports = seedData;