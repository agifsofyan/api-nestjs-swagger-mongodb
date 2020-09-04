FROM node:alpine AS builder
WORKDIR /laruno-client-api
COPY ./package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:alpine
WORKDIR /laruno-client-api
COPY --from=builder /laruno-client-api ./
EXPOSE 5000
CMD ["npm", "run", "start:dev"]