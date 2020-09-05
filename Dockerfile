FROM node:12.16.1-alpine

RUN mkdir -p /laruno-api    
WORKDIR /laruno-api
COPY package.json /laruno-api

RUN npm install
COPY . /laruno-api

RUN npm run build

EXPOSE 5000