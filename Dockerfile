FROM --platform=linux/amd64 node:alpine

WORKDIR /usr/local/collection-log-api

COPY . .

RUN yarn install
RUN yarn run prisma generate

ENTRYPOINT ["yarn", "run", "start:dev"]
