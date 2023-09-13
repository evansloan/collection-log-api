import { Injectable } from '@nestjs/common';
import { CollectionLogTab, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class TabService {
  public Where;
  constructor(private prisma: PrismaService) {}

  async one(
    params?: {
      where?: Prisma.CollectionLogTabWhereInput;
      include?: Prisma.CollectionLogTabInclude;
      orderBy?: Prisma.CollectionLogOrderByWithRelationInput;
    }
  ): Promise<CollectionLogTab|null> {
    return this.prisma.collectionLogTab
      .findFirst(params);
  }

  async all(
    params?: {
      skip?: number;
      take?: number;
      cursor?: Prisma.CollectionLogTabWhereUniqueInput;
      where?: Prisma.CollectionLogTabWhereInput;
      orderBy?: Prisma.CollectionLogTabOrderByWithRelationInput;
    }
  ): Promise<CollectionLogTab[]> {
    return this.prisma.collectionLogTab
      .findMany(params);
  }

  async create(data: Prisma.CollectionLogTabCreateInput): Promise<CollectionLogTab> {
    return this.prisma.collectionLogTab
      .create({ data });
  }

  async update(
    params: {
      where: Prisma.CollectionLogTabWhereUniqueInput;
      data: Prisma.CollectionLogTabUpdateInput;
    }
  ): Promise<CollectionLogTab> {
    return this.prisma.collectionLogTab
      .update(params);
  }

  async getByName(name: string): Promise<CollectionLogTab> {
    return await this.one({
      where: {
        name: {
          mode: 'insensitive',
          equals: name.toLowerCase(),
        },
        deletedAt: null,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }
}