FROM oven/bun:latest

WORKDIR /usr/local/app

COPY . .

RUN bun install

ENTRYPOINT ["bun", "run", "dev"]
