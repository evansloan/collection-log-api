FROM node:latest

WORKDIR /usr/local/app

COPY . .

RUN yarn install

ENTRYPOINT [ "sh", "-c", "./docker/entrypoint.sh" ]
