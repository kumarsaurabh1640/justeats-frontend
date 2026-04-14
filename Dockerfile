# ── Stage 1: Builder ─────────────────────────────────────────────────────────
# Install dependencies and build the Vite/React app into static files.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first so Docker can cache the npm install layer.
# The layer is only re-run when package.json or package-lock.json changes.
COPY package.json package-lock.json ./

RUN npm ci --silent

# Copy the rest of the source code
COPY . .

# VITE_API_URL must be provided at build time so Vite can bake it into
# the JS bundle. Pass it via --build-arg when running docker build.
#   docker build --build-arg VITE_API_URL=https://api.example.com -t justeats-frontend .
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build
# Output goes to /app/dist


# ── Stage 2: Runtime (nginx) ─────────────────────────────────────────────────
# Serve the compiled static files with nginx — no Node.js in the final image.
FROM nginx:1.27-alpine AS runtime

# Remove the default nginx placeholder page
RUN rm -rf /usr/share/nginx/html/*

# Copy the Vite build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config: serve index.html for all routes so React Router works correctly
# (without this, refreshing any non-root URL returns 404)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
