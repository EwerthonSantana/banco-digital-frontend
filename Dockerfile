# ---- Estagio de build: compila o app Angular ----
FROM node:22-alpine AS build
WORKDIR /app

# Instala dependencias primeiro (camada cacheavel)
COPY package.json ./
RUN npm install

# Copia o restante e gera o build de producao
COPY . .
RUN npm run build

# ---- Estagio de runtime: serve os arquivos estaticos com nginx ----
FROM nginx:1.27-alpine

# Config com fallback de SPA (rotas do Angular funcionam ao dar refresh)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# O builder do Angular gera a saida em dist/<projeto>/browser
COPY --from=build /app/dist/banco-digital-frontend/browser /usr/share/nginx/html

EXPOSE 80
