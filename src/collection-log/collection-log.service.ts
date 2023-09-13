import { Injectable } from '@nestjs/common';
import { CollectionLog, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { PageService } from '../page/page.service';

type CollectionLogWithItems = Prisma.CollectionLogGetPayload<{
  include: {
    items: true;
  };
}>;

type CollectionLogWithKillCounts = Prisma.CollectionLogGetPayload<{
  include: {
    killCounts: true;
  };
}>;

type CollectionLogWithUser = Prisma.CollectionLogGetPayload<{
  include: {
    user: true;
  };
}>;

export type FullCollectionLog = CollectionLogWithItems
  & CollectionLogWithKillCounts
  & CollectionLogWithUser;

@Injectable()
export class CollectionLogService {
  private static readonly DEFAULT_INCLUDE: Prisma.CollectionLogInclude = {
    items: {
      orderBy: {
        sequence: 'asc',
      },
    },
    killCounts: {
      orderBy: {
        sequence: 'asc',
      },
    },
    user: true,
  };

  constructor(
    private prisma: PrismaService,
    private pageService: PageService
  ) {}

  async one(
    params?: {
      where?: Prisma.CollectionLogWhereInput;
      include?: Prisma.CollectionLogInclude;
      orderBy?: Prisma.CollectionLogOrderByWithRelationInput;
    }
  ): Promise<CollectionLog|null> {
    return this.prisma.collectionLog.findFirst(params);
  }

  async all(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.CollectionLogWhereUniqueInput;
      where?: Prisma.CollectionLogWhereInput;
      orderBy?: Prisma.CollectionLogOrderByWithRelationInput;
    }
  ): Promise<CollectionLog[]> {
    return this.prisma.collectionLog.findMany(params);
  }

  async create(data: Prisma.CollectionLogCreateInput): Promise<CollectionLog> {
    return this.prisma.collectionLog.create({ data });
  }

  async update(
    params: {
      where: Prisma.CollectionLogWhereUniqueInput;
      data: Prisma.CollectionLogUpdateInput;
    }
  ): Promise<CollectionLog> {
    return this.prisma.collectionLog.update(params);
  }

  async getByUsername(username: string, includeRelated = true): Promise<CollectionLog|FullCollectionLog|null> {
    let include = {};
    if (includeRelated) {
      include = CollectionLogService.DEFAULT_INCLUDE;
    }

    return await this.one({
      where: {
        user: {
          username: {
            mode: 'insensitive',
            equals: username,
          },
        },
        deletedAt: null,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include,
    });
  }

  async getByAccountHash(accountHash: string, includeRelated = true): Promise<CollectionLog|FullCollectionLog|null> {
    let include = {};
    if (includeRelated) {
      include = CollectionLogService.DEFAULT_INCLUDE;
    }

    return await this.one({
      where: {
        user: {
          accountHash,
        },
        deletedAt: null,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include,
    });
  }

  async formatCollectionLog(collectionLog: FullCollectionLog): Promise<any> {
    const {
      items,
      killCounts,
      user,
    } = collectionLog;

    const collectionLogPages = await this.pageService.all();
    const collectionLogTabs = await this.prisma.collectionLogTab.findMany({
      where: { deletedAt: null },
    });

    const formatted: any = {
      collectionLogId: collectionLog.id,
      collectionLogUserId: user.id,
      collectionLog: {
        tabs: {},
        username: user.username,
        accountType: user.accountType,
        totalObtained: collectionLog.totalObtained,
        totalItems: collectionLog.totalItems,
        uniqueObtained: collectionLog.uniqueObtained,
        uniqueItems: collectionLog.uniqueItems,
      },
    };

    const findPage = (pageId: string) => {
      return collectionLogPages.find((page) => page.id == pageId);
    };

    const findTab = (tabId: string) => {
      return collectionLogTabs.find((tab) => tab.id == tabId);
    };

    items.forEach((item) => {
      const {
        itemId,
        name,
        quantity,
        obtained,
        obtainedAt,
        sequence,
        pageId,
      } = item;

      const page = findPage(pageId);
      if (!page) {
        return;
      }

      const tab = findTab(page.tabId);
      if (!tab) {
        return;
      }

      if (!formatted.collectionLog.tabs[tab.name]) {
        formatted.collectionLog.tabs[tab.name] = {};
      }

      if (!formatted.collectionLog.tabs[tab.name][page.name]) {
        formatted.collectionLog.tabs[tab.name][page.name] = { items: [] };
      }

      const formattedPage = formatted.collectionLog.tabs[tab.name][page.name];
      formattedPage.items.push({
        id: itemId,
        name,
        quantity,
        obtained,
        obtainedAt,
        sequence,
      });
    });

    killCounts.forEach((kc) => {
      const {
        name,
        amount,
        sequence,
        pageId,
      } = kc;

      const page = findPage(pageId);
      if (!page) {
        return;
      }

      const tab = findTab(page.tabId);
      if (!tab) {
        return;
      }

      const formattedPage = formatted.collectionLog.tabs[tab.name][page.name];
      if (!formattedPage.killCount) {
        formattedPage.killCount = [];
      }

      formattedPage.killCount.push({
        name,
        amount,
        sequence,
      });
    });

    return formatted;
  }
}