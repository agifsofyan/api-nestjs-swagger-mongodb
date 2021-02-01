FROM node:14-alpine

WORKDIR ./

COPY package*.json ./
COPY .env.example ./
ADD .env.example .env

RUN npm install

COPY . ./

RUN npm run build

EXPOSE 8080

CMD ["node", "dist/main.js"]

FROM nginx:alpine
COPY ./nginx-conf/nginx.conf /etc/nginx/nginx.conf
COPY ./src/sert/ /etc/nginx/nginx.conf