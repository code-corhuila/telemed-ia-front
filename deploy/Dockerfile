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

# Remove the default nginx index so we can't accidentally serve it.
RUN rm -f /usr/share/nginx/html/index.html /usr/share/nginx/html/50x.html

# Angular 21 puts the real bundle inside `browser/`.
COPY --from=build /workspace/dist/telemed-ia-front/browser /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]