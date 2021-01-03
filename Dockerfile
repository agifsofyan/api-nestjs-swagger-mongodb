# DEVELOPMENT

FROM node:14-alpine

#ENV NODE_ENV=development

WORKDIR /app/laruno-api

COPY package*.json ./

RUN npm install

#COPY . .

#ADD . /app/laruno-api

#RUN npm run build

EXPOSE 5000:5000

#CMD ["npm", "run" "start"]

# PRODUCTION

# FROM node:latest AS production

# ARG NODE_ENV=production
# ENV NODE_ENV=${NODE_ENV}

# WORKDIR /app/laruno-api

# COPY package.json ./

# RUN npm install --only=production

# COPY . .

# COPY --from=dev /app/laruno-api/dist ./dist

# EXPOSE 5000

#CMD ["npm", "run", "start:prod", "start:dev"]
