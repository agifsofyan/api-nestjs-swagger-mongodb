FROM node:latest AS BASE

WORKDIR /app

COPY package.json ./

RUN npm install

FROM BASE AS DEV

COPY .eslintrc.js \
  .prettierrc \
  nest-cli.json \
  tsconfig.* \
  ./
COPY ./src/ ./src/

RUN npm run build 

FROM node:latest

COPY --from=BASE /app/package.json ./
COPY --from=DEV /app/dist/ ./dist/
# COPY --from=BASE /app/node_modules/ ./node_modules/

EXPOSE 5000

CMD ["node", "dist/main.js"]