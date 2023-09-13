import { Injectable } from '@nestjs/common';
import { CollectionLogItem, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {
  }

  async one(
    params?: {
      where?: Prisma.CollectionLogItemWhereInput;
      include?: Prisma.CollectionLogItemInclude;
      orderBy?: Prisma.CollectionLogItemOrderByWithRelationInput;
    }
  ): Promise<CollectionLogItem | null> {
    return this.prisma.collectionLogItem.findFirst(params);
  }

  async all(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.CollectionLogItemWhereUniqueInput;
      where?: Prisma.CollectionLogItemWhereInput;
      orderBy?: Prisma.CollectionLogItemOrderByWithRelationInput;
    }
  ): Promise<CollectionLogItem[]> {
    return this.prisma.collectionLogItem.findMany(params);
  }

  async create(data: Prisma.CollectionLogItemCreateInput): Promise<CollectionLogItem> {
    return this.prisma.collectionLogItem.create({ data });
  }

  async update(
    params: {
      where: Prisma.CollectionLogItemWhereUniqueInput;
      data: Prisma.CollectionLogItemUpdateInput;
    }
  ): Promise<CollectionLogItem> {
    return this.prisma.collectionLogItem.update(params);
  }
}