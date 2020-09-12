FROM node:latest AS dev

WORKDIR /app

COPY package.json ./

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

COPY --from=base /app/package.json ./
COPY --from=dev /app/dist/ ./dist/
COPY --from=base /app/node_modules/ ./node_modules/

EXPOSE 5000

CMD ["npm", "run", "start:prod"]