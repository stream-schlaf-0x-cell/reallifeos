FROM node:20-alpine
WORKDIR /app

# Kopiere Package-Dateien
COPY package*.json ./

# Installiere Dependencies (mit --legacy-peer-deps für vite-plugin-pwa Kompatibilität)
RUN npm install --legacy-peer-deps

# Kopiere den Rest des Codes
COPY . .

# Exponiere den Vite-Port
EXPOSE 5173

# Starte Vite mit Host-Bindung (wichtig für Zugriff von außen!)
CMD ["npm", "run", "dev", "--", "--host"]
