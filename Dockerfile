# DEVELOPMENT
FROM node:14-alpine

WORKDIR /app/laruno-api

COPY package*.json ./
COPY .env.example ./
ADD .env.example .env

RUN npm install

COPY . /app/laruno-api

RUN npm run build

# PRODUCTION
#FROM node:14-alpine AS production

#ARG NODE_ENV=production
#ENV NODE_ENV=${NODE_ENV}

#WORKDIR /app/laruno-api

#COPY package.json ./

#RUN npm install --only=production

COPY . /app/laruno-api

#COPY --from=dev /app/laruno-api/dist ./dist

EXPOSE 5000

CMD ["npm", "run", "start:prod"]