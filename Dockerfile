FROM node:14-alpine AS builder

ENV NODE_ENV build

RUN mkdir -p /laruno-api
WORKDIR /laruno-api
COPY . /laruno-api

RUN npm install \
    && npm run build

# ---

FROM node:14-alpine

ENV NODE_ENV production

WORKDIR /laruno-api

COPY --from=builder /laruno-api/package*.json /laruno-api/
COPY --from=builder /laruno-api/dist/ /laruno-api/dist/

RUN npm install

CMD ["npm", "run", "start:prod"]