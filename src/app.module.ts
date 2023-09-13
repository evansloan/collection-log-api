import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CollectionLogController } from './collection-log/collection-log.controller';
import { CollectionLogService } from './collection-log/collection-log.service';
import { configuration } from '../config/config';
import { PrismaService } from './prisma.service';
import { ItemController } from './item/item.controller';
import { ItemService } from './item/item.service';
import { PageService } from './page/page.service';
import { TabService } from './tab/tab.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env`,
      load: [configuration],
    }),
  ],
  controllers: [
    CollectionLogController,
    ItemController,
  ],
  providers: [
    CollectionLogService,
    ItemService,
    PageService,
    PrismaService,
    TabService,
  ],
})
export class AppModule {}
