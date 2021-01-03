# DEVELOPMENT
FROM node:14-alpine

WORKDIR /app/laruno-api

COPY package*.json ./
COPY .env.example ./
ADD .env.example .env
COPY tsconfig.json ./
COPY nest-cli.json ./

RUN npm install

COPY . /app/laruno-api

#RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "build"]

# PRODUCTION
#FROM node:14-alpine AS production

#WORKDIR /app/laruno-api

#COPY --from=dev /app/laruno-api/dist ./dist

#EXPOSE 5000

#CMD ["node", "dist/main"]
