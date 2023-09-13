import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';

import { ItemService } from './item.service';
import { CollectionLogService, FullCollectionLog } from '../collection-log/collection-log.service';
import { PageService } from '../page/page.service';

@Controller('items')
export class ItemController {
  constructor(
    private readonly collectionLogService: CollectionLogService,
    private readonly itemService: ItemService,
    private readonly pageService: PageService
  ) {}

  @Get('user/:username')
  async getPageByUsername(
    @Param('username') username: string,
    @Query('pageName') pageName: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ): Promise<any> {
    const collectionLog = await this.collectionLogService.getByUsername(username) as FullCollectionLog;

    if (!collectionLog) {
      throw new NotFoundException({ error: `Unable to find collection log for user ${username}` });
    }

    if (!pageName) {
      throw new BadRequestException({ error: 'Missing required query parameter pageName' });
    }

    const page = await this.pageService.getByName(pageName);
    if (!page) {
      throw new NotFoundException({ error: `Collection log page not found with name ${pageName}` });
    }

    const {
      items,
      killCounts,
      user,
    } = collectionLog;

    console.log(parseInt(offset));

    const start = parseInt(offset) ? parseInt(offset) : 0;
    const end = parseInt(limit) ? parseInt(limit) + start : undefined;

    const pageItems = items.filter((item) => item.pageId == page.id)
      .map((item) => ({
        id: item.itemId,
        name: item.name,
        quantity: item.quantity,
        sequence: item.sequence,
        obtained: item.obtained,
        obtainedAt: item.obtainedAt,
      }))
      .slice(start, end);

    const pageKcs = killCounts.filter((kc) => kc.pageId == page.id)
      .map((kc) => ({
        name: kc.name,
        amount: kc.amount,
        sequence: kc.sequence,
      }));

    return {
      username: user.username,
      page: page.name,
      itemCount: pageItems.length,
      obtainedCount: pageItems.filter((item) => item.obtained).length,
      items: pageItems,
      killCount: pageKcs,
    };
  }
}
