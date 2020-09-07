FROM node:latest AS development

ENV NODE_ENV=development

WORKDIR /app

COPY package.json ./

RUN npm install --only=development

COPY . .

RUN npm run build

FROM node:latest AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY --from=development /app/dist/ ./dist

EXPOSE 5000

CMD ["node", "dist/main"]