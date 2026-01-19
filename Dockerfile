# Usiamo la stessa immagine base del prof (ottima scelta, leggera)
FROM node:18-alpine
# Metadati opzionali
LABEL maintainer="Ernesto"

# Impostiamo la directory di lavoro dentro il container
WORKDIR /app

# 1. Copiamo PRIMA solo i file delle dipendenze.
# Questo è un trucco ("Layer Caching"): se cambi il codice ma non le librerie,
# Docker non riscaricherà tutto npm install, rendendo la build velocissima.
COPY package*.json ./

# Installiamo le librerie
RUN npm install

# 2. Copiamo tutto il resto del codice sorgente
COPY . .

# Il comando "RUN npm run compile" lo togliamo perché stiamo usando JS puro.
# Se un domani passiamo a TypeScript, lo rimetteremo.

# Esponiamo la porta 3000 (quella che abbiamo messo in server.js e .env)
# Il prof usava la 8080, noi usiamo la 3000.
EXPOSE 3000

# Comando di avvio: lanciamo il nostro server.js
CMD ["node", "server.js"]
