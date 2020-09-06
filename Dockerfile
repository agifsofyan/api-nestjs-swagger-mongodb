FROM node:14-alpine AS builder

ENV NODE_ENV build

USER dev-client-api
WORKDIR /home/dev-client-api

COPY . /home/dev-client-api

RUN npm ci \
    && npm run build

# ---

FROM node:12-alpine

ENV NODE_ENV production

USER dev-client-api
WORKDIR /home/dev-client-api

COPY --from=builder /home/dev-client-api/package*.json /home/dev-client-api/
COPY --from=builder /home/dev-client-api/dist/ /home/dev-client-api/dist/

RUN npm ci

CMD ["npm", "run", "start:prod"]