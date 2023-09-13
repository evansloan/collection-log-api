import { Test, TestingModule } from '@nestjs/testing';
import { CollectionLogController } from './collection-log.controller';
import { CollectionLogService } from './collection-log.service';

describe('CollectionLogController', () => {
  let collectionLogController: CollectionLogController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CollectionLogController],
      providers: [CollectionLogService],
    }).compile();

    collectionLogController = app.get<CollectionLogController>(CollectionLogController);
  });

  describe('get collection log by username', () => {
    it('should return formatted collection log', () => {
      expect(collectionLogController.getByUsername('testuser9')).toBeDefined();
    });
  });
});
