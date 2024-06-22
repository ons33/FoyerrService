# Utilise l'image officielle de Node.js 16 comme base
FROM node:16

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Installe nodemon globalement
RUN npm install -g nodemon

# Copie les fichiers de dépendances et installe les dépendances avec des options pour augmenter le délai d'attente et des essais multiples
COPY package*.json ./

# Augmente le délai d'attente de l'installation npm et effectue des essais multiples en cas d'échec
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 10 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set network-timeout 300000 \
    && npm install --legacy-peer-deps || \
    (echo "Retrying npm install..." && npm install --legacy-peer-deps) || \
    (echo "Retrying npm install..." && npm install --legacy-peer-deps)

# Copie le reste du code source de l'application dans le conteneur
COPY . .

# Expose le port sur lequel ton application s'exécutera dans le conteneur
EXPOSE 3004

# Commande pour démarrer ton application avec nodemon
CMD ["nodemon", "server.js"]
