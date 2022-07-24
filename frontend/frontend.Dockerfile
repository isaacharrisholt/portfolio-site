FROM node:16-alpine3.15

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD [ "npm", "run", "dev", "--" ]