const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Genera il Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Il login dura 30 giorni
    });
};

// @desc    Registra un nuovo passeggero
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { email, password, name, surname, birthDate } = req.body;

        // Verifica se esiste già
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Utente già esistente' });
        }

        // Crea utente (Forziamo ruolo 'passenger' per le registrazioni pubbliche)
        const user = await User.create({
            email,
            password,
            role: 'passenger', // [cite: 261] Gestione ruoli
            name,
            surname,
            birthDate
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role)
            });
        } else {
            res.status(400).json({ message: 'Dati utente non validi' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login utente & ottieni token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    // --- DEBUG LOG START ---
    console.log("🔑 TENTATIVO DI LOGIN RICEVUTO");
    console.log("📦 Dati ricevuti (Body):", req.body);
    // -----------------------

    const { email, password } = req.body;

    try {
        // 1. Controllo se i dati arrivano
        if (!email || !password) {
            console.log("❌ ERRORE: Mancano email o password");
            return res.status(400).json({ message: 'Inserisci email e password' });
        }

        // 2. Cerco l'utente
        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ ERRORE: Utente non trovato nel DB per email:", email);
            return res.status(401).json({ message: 'Credenziali non valide (Utente non trovato)' });
        }

        console.log("👤 Utente trovato:", user.email);
        console.log("🔒 Password nel DB (Hash o testo):", user.password);
        console.log("INPUT Password inserita:", password);

        // 3. Verifica Password
        // NOTA: Se nel seed non hai usato l'hashing, qui potrebbe fallire se usi bcrypt.compare
        // Proviamo prima il confronto diretto per sicurezza (se il seed è in chiaro)
        const isMatch = await bcrypt.compare(password, user.password);
        
        // DEBUG SPECIALE: Se il confronto fallisce, stampalo
        if (!isMatch) {
            console.log("❌ ERRORE: Password non corrispondono (bcrypt ha detto NO)");
            // Fallback: controllo se per caso nel DB è salvata in chiaro (solo per debug!)
            if (password === user.password) {
                 console.log("⚠️ ATTENZIONE: La password nel DB è in chiaro, ma il codice usa bcrypt!");
            }
            return res.status(401).json({ message: 'Credenziali non valide (Password errata)' });
        }

        console.log("✅ LOGIN RIUSCITO!");

        // 4. Genera Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'latuasecretkey', // Fallback se manca env
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("🔥 ERRORE SERVER:", error);
        res.status(500).json({ message: error.message });
    }
};