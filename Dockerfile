FROM node:14-alpine

ENV NODE_ENV=production

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 3030

CMD [ "yarn", "start:watch" ]
