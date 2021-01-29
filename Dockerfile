# Development
FROM node:14-alpine AS development

WORKDIR /app/laruno-api

COPY package*.json ./
COPY .env.example ./
ADD .env.example .env

RUN npm install

# COPY . /app/laruno-api
COPY . .

RUN npm run build

# Production
FROM node:14-alpine AS production

WORKDIR /app/laruno-api

COPY package*.json ./

RUN npm install --only=production

COPY . .
COPY --from=development /app/laruno-api/dist ./dist

EXPOSE 4000

CMD ["npm", "run", "start:prod"]