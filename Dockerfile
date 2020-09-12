FROM node:latest AS dev

ENV NODE_ENV=development

WORKDIR /laruno-api/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# FROM base AS dev

# COPY .eslintrc.js \
#   .prettierrc \
#   nest-cli.json \
#   tsconfig.* \
#   ./
# COPY ./src/ ./src/

# RUN npm run build

FROM node:latest AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /laruno-api/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

EXPOSE 5000

CMD ["npm", "run", "start:prod"]