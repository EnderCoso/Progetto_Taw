const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Assicurati di fare npm install bcryptjs

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['admin', 'airline', 'passenger'], 
        required: true 
    },
    // Dati specifici per Passeggeri
    name: { type: String },
    surname: { type: String },
    birthDate: { type: Date },

    // Dati specifici per Compagnie Aeree
    airlineName: { type: String }, // Nome della compagnia
    iataCode: { type: String, uppercase: true }, // Es: AZ, RYR
    
    createdAt: { type: Date, default: Date.now }
});

// Middleware per hashare la password prima di salvare (Sicurezza base!)
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Metodo helper per confrontare password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);