# DEVELOPMENT
FROM node:14-alpine

WORKDIR /app/laruno-api AS dev

COPY package*.json ./
COPY .env.example ./
ADD .env.example .env
COPY tsconfig.json ./
COPY nest-cli.json ./

RUN npm install

COPY . /app/laruno-api

RUN npm run build

# PRODUCTION
#FROM node:14-alpine AS production

#ARG NODE_ENV=production
#ENV NODE_ENV=${NODE_ENV}

#WORKDIR /laruno-backoffice/app

#COPY package.json ./

#RUN npm install --only=production

#COPY . .

COPY --from=dev /app/laruno-api/dist ./dist

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
