# collection-log-api

Serverless API for [collectionlog.net](https://github.com/evansloan/collectionlog.net) and the [collection log Runelite plugin](https://github.com/evansloan/collection-log)

## Getting started

Clone the respository

```
$ git clone https://github.com/evansloan/collection-log-api && cd collection-log-api
```

### Docker setup

1. Create .env file

Rename `.env.sample` to `.env`. The variables in this file can be modified to your liking

2. Build and start the Docker container

```
$ docker-compose up
```

3. Apply database migrations

```
$ docker-compose exec api yarn run migrate:latest
```

4. Run database seeders (optional)

```
$ docker-compose exec api yarn run seed
```

5. Connect to the database and API

Database connection string: `postgres://DB_USER:DB_PASS@localhost:DB_MAPPED_PORT/collection_log`

API base URL: `http://localhost:API_PORT/`

### Manual setup

1. Install [PostgreSQL](https://www.postgresql.org/download/)

2. Set up `collection_log` database and user

```
$ createuser <username>
$ createdb collection_log
$ psql
$ ALTER USER <username> WITH encrypted password '<password>'
$ GRANT ALL PRIVILEGES ON DATABASE collection_log TO <username>
```

3. Create .env file

Rename `.env.sample` to `.env` and set the following variables

```
DB_HOST=localhost
DB_USER=<username used in step 2>
DB_PASS=<password set in step 2>
```

[Documentation](https://docs.collectionlog.net)
