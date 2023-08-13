import { AccountType } from '@datatypes/CollectionLogUserData';
import Cache, { CacheStorage } from '@lib/cache/cache';

interface AccountTypeRanks {
  ALL: number;
  [AccountType.IRONMAN]?: number;
  [AccountType.HARDCORE_IRONMAN]?: number;
  [AccountType.ULTIMATE_IRONMAN]?: number;
  [AccountType.GROUP_IRONMAN]?: number;
  [AccountType.HARDCORE_GROUP_IRONMAN]?: number;
  [AccountType.NORMAL]?: number;
}

class RankCache extends Cache<AccountTypeRanks> {
  private static readonly STORAGE: CacheStorage<AccountTypeRanks> = {};

  private static instance: RankCache;

  public name = 'rank';

  private constructor() {
    super(RankCache.STORAGE);
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RankCache();
    }
    return this.instance;
  }
}

export default RankCache;
