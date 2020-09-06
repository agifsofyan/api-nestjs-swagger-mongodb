FROM node:14-alpine

WORKDIR /laruno-api

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start:dev"]