import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit {
  async onModuleInit(): Promise<void> {
    this.applyMiddleware();
    await this.$connect();
  }

  private applyMiddleware(): void {
    this.$use(async (params, next) => {
      const timestamp = Date.now();

      if (params.action == 'delete') {
        params.action = 'update';
        params.args['data'] = { deletedAt: timestamp };
      }
      if (params.action == 'deleteMany') {
        params.action = 'updateMany';
        if (params.args.data != undefined) {
          params.args.data['deletedAt'] = timestamp;
        } else {
          params.args['data'] = { deletedAt: timestamp };
        }
      }
      return next(params);
    });
  }

  async onModuleDestroy(): Promise<void> {
    this.$disconnect();
  }
}
