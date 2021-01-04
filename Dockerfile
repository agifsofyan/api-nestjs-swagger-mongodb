# DEVELOPMENT
FROM node:14-alpine

WORKDIR /app/laruno-api

COPY package*.json ./
COPY .env.example ./
ADD .env.example .env
COPY tsconfig.json ./
COPY nest-cli.json ./

RUN npm install

COPY . /app/laruno-api

RUN npm run build

CMD ["npm", "run", "start:prod"]
