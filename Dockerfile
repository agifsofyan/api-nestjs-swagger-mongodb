FROM node:latest

# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# WORKDIR /home/node/app

WORKDIR /app/laruno-api

COPY package.json ./
COPY .env.example ./
ADD .env.example .env

# USER node
RUN npm install glob rimraf
RUN npm install --only=development
# RUN npm i -D @types/mongoose

COPY . ./

#RUN npm run build

# COPY --chown=node:node . .

EXPOSE 8080

# ENV GENERATE_SOURCEMAP=false

CMD ["npm", "run", "start"]
