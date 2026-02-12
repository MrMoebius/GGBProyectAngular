# ============================================
# Stage 1: Build con Node
# ============================================
FROM node:18-alpine AS build
WORKDIR /app

# Copiar package.json primero (cache de dependencias)
COPY package.json package-lock.json ./
RUN npm ci

# Copiar codigo fuente y compilar
COPY . .
RUN npx ng build --configuration production

# ============================================
# Stage 2: Servir con Nginx
# ============================================
FROM nginx:alpine AS runtime

# Copiar build de Angular
COPY --from=build /app/dist/ggbproyecto-angular /usr/share/nginx/html

# Config de Nginx: proxy /api al backend + SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
