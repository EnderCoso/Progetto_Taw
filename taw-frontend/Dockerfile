# Usa un'immagine Node leggera
FROM node:18-alpine

# Installa Angular CLI globalmente (questo ci serve per creare il progetto)
RUN npm install -g @angular/cli

# Imposta la cartella di lavoro
WORKDIR /app

# Espone la porta
EXPOSE 4200

# IMPORTANTE: Mantiene il container vivo senza fare nulla.
# Non fa 'npm install' e non fa 'ng serve' perché il progetto non esiste ancora.
CMD ["tail", "-f", "/dev/null"]