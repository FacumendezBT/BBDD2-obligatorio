FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Servimos los archivos estáticos generados con Nginx
FROM nginx:1.23-alpine

# El build queda en dist dentro de /app
COPY --from=builder /app/dist /usr/share/nginx/html

# le metemos nuestra config de Ngnix para las rutas.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
