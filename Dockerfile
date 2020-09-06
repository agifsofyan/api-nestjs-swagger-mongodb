FROM node:latest

RUN mkdir -p /laruno-api    
WORKDIR /laruno-api
COPY package.json /laruno-api

RUN npm install
COPY . /laruno-api

EXPOSE 3000

CMD ["npm", "run", "start:prod"]