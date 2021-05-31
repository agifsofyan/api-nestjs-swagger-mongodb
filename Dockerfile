FROM node:14-alpine

# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# WORKDIR /home/node/app

WORKDIR /app/laruno-api

COPY package.json ./
COPY .env.example ./
ADD .env.example .env

# RUN npm install --only=development
RUN npm install

COPY . ./

#RUN npm run build

# COPY --chown=node:node . .

EXPOSE 8000

# ENV GENERATE_SOURCEMAP=false

CMD ["npm", "run", "start"]
