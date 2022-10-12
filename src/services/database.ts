import Knex from 'knex';

export class DatabaseService {
  private static readonly CLIENT: string = 'pg';

  private static readonly HOST: string = process.env.DB_HOST as string;

  private static readonly PORT: number = Number(process.env.DB_PORT);

  private static readonly USER: string = process.env.DB_USER as string;

  private static readonly PASSWORD: string = process.env.DB_PASS as string;

  private static readonly NAME: string = process.env.DB_NAME as string;

  private static readonly DEBUG: boolean = !!process.env.DEBUG;

  private readonly connection;

  constructor() {
    const knexConfig = {
      client: DatabaseService.CLIENT,
      connection: {
        host: DatabaseService.HOST,
        port: DatabaseService.PORT,
        user: DatabaseService.USER,
        password: DatabaseService.PASSWORD,
        database: DatabaseService.NAME,
      },
      pool: {
        min: 0,
        max: 16,
      },
      debug: DatabaseService.DEBUG,
    };

    this.connection = Knex(knexConfig);
  }

  public getConnection = () => {
    return this.connection;
  };
}