# ============================================
# Stage 1: Build con Node
# ============================================
FROM node:20-alpine AS build
WORKDIR /app

# Copiar package files primero (cache de dependencias)
COPY package.json package-lock.json ./

# Instalar dependencias (determinista desde lockfile)
RUN npm ci

# Copiar codigo fuente y compilar
COPY . .
RUN npm run build

# ============================================
# Stage 2: Runtime con nginx
# ============================================
FROM nginx:1.27-alpine AS runtime

# Borrar config por defecto de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar config custom de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build de Angular
COPY --from=build /app/dist/ggbproyecto-angular/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
