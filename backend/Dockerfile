FROM node:20-slim

COPY package*.json ./

RUN npm install --production

COPY . .

# Exponemos el puerto en el que el back levanta.
EXPOSE 8080

# Comando para iniciar el back.
CMD [ "npm", "start" ]
