FROM node:14-alpine

ENV API_PORT=3001

WORKDIR /usr/src/app

COPY ["package.json", "yarn.lock", "tsconfig.json", ".env", "knexfile.ts", "serverless.yml", "./"]
COPY ./src ./src
COPY ./migrations ./migrations
COPY ./resources ./resources

RUN yarn install

CMD yarn run serverless offline start --noTimeout --stage=local --host=0.0.0.0 --httpPort=$API_PORT --useChildProcesses
