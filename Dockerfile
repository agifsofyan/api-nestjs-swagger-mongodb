# DEVELOPMENT

FROM node:14-alpine

#ENV NODE_ENV=development

WORKDIR /app/laruno-api

COPY package*.json ./

RUN npm install

#COPY . .

ADD . /app/laruno-api

RUN npm run build

CMD ["npm", "run", "start:prod"]
