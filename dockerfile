# 1. Adım: Derleme ortamını kur
FROM node:20-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
# Git gerektiren bağımlılıklar için Git'i kur
RUN apk add --no-cache git
RUN npm install

COPY . .

FROM node:20-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add --no-cache git
RUN npm ci --only=production

COPY --from=builder /usr/src/app .

EXPOSE 3000
CMD [ "node", "server.js" ] 

git add Dockerfile
git commit -m "feat: Add git to Dockerfile for npm dependencies"

caprover deploy --default