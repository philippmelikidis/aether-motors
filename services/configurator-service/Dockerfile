# Multi-stage build:
#   1) build stage compiles Tailwind into public/css/app.css
#   2) runtime stage ships only what the service needs at runtime
# ----------------------------------------------------------------------------
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .

RUN npm run build:css


# ----------------------------------------------------------------------------
FROM node:18-alpine AS runtime

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Server code
COPY server.js ./
COPY src ./src
COPY views ./views

# Compiled assets from the build stage
COPY --from=build /app/public ./public

EXPOSE 3008

CMD ["npm", "start"]
