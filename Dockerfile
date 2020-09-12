FROM node:latest AS base

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

FROM base AS dev

COPY .eslintrc.js \
  .prettierrc \
  nest-cli.json \
  tsconfig.* \
  ./
COPY ./src/ ./src/

CMD ["npm", "run", "build:dev"]

FROM node:latest

COPY --from=base /app/package.json ../
COPY --from=dev /app/dist/ ../dist/
COPY --from=base /app/node_modules/ ../node_modules/

EXPOSE 5000

CMD ["npm", "run", "start:prod"]