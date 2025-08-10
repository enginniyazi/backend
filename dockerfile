FROM node:20-alpine AS builder
RUN apk add --no-cache git build-base python3
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

FROM node:20-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app .
EXPOSE 3000
CMD [ "node", "server.js" ]