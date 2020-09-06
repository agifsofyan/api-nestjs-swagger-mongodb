FROM node:latest

RUN mkdir -p /laruno-api    
WORKDIR /laruno-api
COPY package.json /laruno-api

RUN npm ci
COPY . /laruno-api

EXPOSE 3000

CMD ["npm", "run", "start:prod"]