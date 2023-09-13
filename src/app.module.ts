import { Module } from '@nestjs/common';

import { CollectionLogController } from './collection-log/collection-log.controller';
import { CollectionLogService } from './collection-log/collection-log.service';
import { PrismaService } from './prisma.service';
import { ItemController } from './item/item.controller';
import { ItemService } from './item/item.service';
import { PageService } from './page/page.service';

@Module({
  imports: [],
  controllers: [
    CollectionLogController,
    ItemController,
  ],
  providers: [
    CollectionLogService,
    ItemService,
    PageService,
    PrismaService,
  ],
})
export class AppModule {}
