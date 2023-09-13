import { Injectable } from '@nestjs/common';
import { CollectionLogPage, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class PageService {
  constructor(private prisma: PrismaService) {}

  async one(
    params?: {
      where?: Prisma.CollectionLogPageWhereInput;
      include?: Prisma.CollectionLogPageInclude;
      orderBy?: Prisma.CollectionLogPageOrderByWithRelationInput;
    }
  ): Promise<CollectionLogPage|null> {
    return this.prisma.collectionLogPage.findFirst(params);
  }

  async all(
    params?: {
      skip?: number;
      take?: number;
      cursor?: Prisma.CollectionLogPageWhereUniqueInput;
      where?: Prisma.CollectionLogPageWhereInput;
      orderBy?: Prisma.CollectionLogPageOrderByWithRelationInput;
    }
  ): Promise<CollectionLogPage[]> {
    return this.prisma.collectionLogPage.findMany(params);
  }

  async create(data: Prisma.CollectionLogPageCreateInput): Promise<CollectionLogPage> {
    return this.prisma.collectionLogPage.create({ data });
  }

  async update(
    params: {
      where: Prisma.CollectionLogPageWhereUniqueInput;
      data: Prisma.CollectionLogPageUpdateInput;
    }
  ): Promise<CollectionLogPage> {
    return this.prisma.collectionLogPage.update(params);
  }

  async getByName(name: string): Promise<CollectionLogPage> {
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