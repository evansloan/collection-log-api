export const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV,
  serverHost: process.env.SERVER_HOST,
  serverPort: process.env.SERVER_PORT,
  dbPort: parseInt(process.env.DB_PORT, 10) || 5432,
  dbName: process.env.DB_NAME,
  dbUrl: process.env.DATABASE_URL,
});