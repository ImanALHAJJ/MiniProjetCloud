# Spécifie l’image de base utilisée pour construire l’environnement
FROM alpine:3.20
#Définit le répertoire de travail dans le conteneur où seront copiés tous les fichiers de l’application.
WORKDIR /usr/src/app
#Installe Node.js et npm dans le conteneur à l’aide du gestionnaire de paquets apk
RUN apk add --no-cache nodejs npm
#Copie les fichiers de configuration du projet (liste des dépendances) et installe tous les modules nécessaires pour exécuter l’application.
COPY package*.json ./
RUN npm install
#Copie le code compilé TypeScript vers le conteneur,Cela évite d’avoir à recompiler dans le conteneur
COPY dist/ ./dist/
#Créent un utilisateur non privilégié node et lui attribuent les droits sur le répertoire de travail.
RUN addgroup -S node && adduser -S node -G node
RUN chown -R node:node /usr/src/app
#Définit que toutes les commandes suivantes s’exécuteront sous l’utilisateur node.
USER node

RUN npm run build || echo "No build step defined"
#Indique la commande principale à exécuter lors du démarrage du conteneur.
CMD ["node", "dist/server.js"]
