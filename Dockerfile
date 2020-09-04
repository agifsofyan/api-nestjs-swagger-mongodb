FROM node:alpine

RUN mkdir -p /laruno-client-api    
WORKDIR /laruno-client-api
COPY package.json /laruno-client-api

RUN npm install && npm audit fix
COPY . /laruno-client-api

EXPOSE 5000

CMD ["npm", "run", "start:dev"]
