# syntax=docker/dockerfile:1.7

# ---------- build stage ----------
FROM node:22-alpine AS build
WORKDIR /workspace

# Copy manifests first so `npm ci` is cached across rebuilds.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the sources and build the production bundle.
COPY angular.json federation.config.js tsconfig.json tsconfig.app.json tsconfig.federation.json ./
COPY public ./public
COPY src ./src
RUN npm run build

# ---------- runtime stage ----------
FROM nginx:1.27-alpine
COPY --from=build /workspace/dist/telemed-ia-front /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]