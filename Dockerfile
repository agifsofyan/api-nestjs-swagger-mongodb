FROM node:14-alpine

RUN mkdir -p /laruno-api    
WORKDIR /laruno-api
COPY package.json /laruno-api

RUN npm install
COPY . /laruno-api

EXPOSE 5000