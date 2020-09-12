# FROM node:latest AS base
FROM node:latest

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

# FROM base AS dev

# COPY .eslintrc.js \
#   .prettierrc \
#   nest-cli.json \
#   tsconfig.* \
#   ./
# COPY ./src/ ./src/

# RUN npm run build 

# FROM node:latest

# COPY --from=base /app/package.json ./
# COPY --from=dev /app/dist/ ./dist/
# COPY --from=base /app/node_modules/ ./node_modules/

EXPOSE 5000

CMD ["npm", "run", "start:dev"]