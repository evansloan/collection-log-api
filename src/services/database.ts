import knex, { Knex } from 'knex';
import { Model } from 'objection';

export class DatabaseService {
  private static readonly CLIENT: string = 'pg';

  private static readonly HOST: string = process.env.DB_HOST as string;

  private static readonly PORT: number = Number(process.env.DB_PORT);

  private static readonly USER: string = process.env.DB_USER as string;

  private static readonly PASSWORD: string = process.env.DB_PASS as string;

  private static readonly NAME: string = process.env.DB_NAME as string;

  private static readonly DEBUG: boolean = !!process.env.DEBUG;

  private static instance: DatabaseService;

  private connection: Knex|undefined;

  private static readonly knexConfig: Knex.Config = {
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
      max: 1,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 1500,
      createRetryIntervalMillis: 500,
      idleTimeoutMillis: 500,
      reapIntervalMillis: 500,
      propagateCreateError: false,
    },
    debug: DatabaseService.DEBUG,
  };

  constructor() {
    this.connection = knex(DatabaseService.knexConfig);
    Model.knex(this.connection);
  }

  public static getInstance = () => {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }

    return DatabaseService.instance;
  };

  public getConnection = () => {
    if (!this.connection) {
      this.connection = knex(DatabaseService.knexConfig);
      Model.knex(this.connection);
    }
    return this.connection;
  };

  public destroyConnection = async () => {
    await this.connection?.destroy();
    this.connection = undefined;
  };
}