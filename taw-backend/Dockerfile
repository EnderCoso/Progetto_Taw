# Usa un'immagine leggera di Node
FROM node:18-alpine

# Imposta la cartella di lavoro dentro il container
WORKDIR /app

# Copia solo i file delle dipendenze per sfruttare la cache
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Installa nodemon globalmente per il riavvio automatico (fondamentale per lo sviluppo!)
RUN npm install -g nodemon

# Copia tutto il resto del codice
COPY . .

# Espone la porta 3000 (quella del backend)
EXPOSE 3000

# Comando di avvio: usa nodemon per ricaricare se cambi i file
CMD ["nodemon", "server.js"]