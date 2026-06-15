FROM node:18.13.0-alpine AS node-base

RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/dist

FROM node-base AS build-stage

WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build

FROM build-stage AS production-stage

WORKDIR /usr/src/app
# RUN npm run knex -- migrate:latest
CMD ["sh", "-c", "npm run knex -- migrate:latest && npm start"]