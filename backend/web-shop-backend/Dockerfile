FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build:css

FROM node:18-alpine AS runtime

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=build /app/views ./views
COPY --from=build /app/public ./public
COPY --from=build /app/data ./data
COPY --from=build /app/server.js ./server.js

EXPOSE 3000

CMD ["node", "server.js"]
