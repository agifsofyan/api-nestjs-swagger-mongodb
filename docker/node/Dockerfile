FROM node:14-alpine

WORKDIR /app/laruno-api/docker/node

COPY package*.json ./
COPY .env.example ./
ADD .env.example .env

RUN npm install

#COPY . /app/laruno-api
COPY . .

RUN npm run build

#COPY . /app/laruno-api
COPY . .

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
