import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { CollectionLogService, FullCollectionLog } from './collection-log.service';

@Controller(['collection-log', 'collectionlog'])
export class CollectionLogController {
  constructor(private readonly collectionLogService: CollectionLogService) {}

  @Get('user/:username')
  async getByUsername(@Param('username') username: string): Promise<any> {
    const collectionLog = await this.collectionLogService.getByUsername(username) as FullCollectionLog;
    if (!collectionLog) {
      throw new NotFoundException({ error: `Unable to find collection log for user ${username}` });
    }

    return this.collectionLogService.formatCollectionLog(collectionLog);
  }

  @Get('exists/:accountHash')
  async getExists(@Param('accountHash') accountHash: string): Promise<{ exists: boolean }> {
    const collectionLog = await this.collectionLogService.getByAccountHash(accountHash, false);
    return { exists: collectionLog != null };
  }
}
