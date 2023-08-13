import Cache, { CacheStorage } from '@lib/cache/cache';

class CollectionLogCache extends Cache<any> {
  private static readonly STORAGE: CacheStorage<any> = {};

  private static instance: CollectionLogCache;

  public name = 'collection_log';

  private constructor() {
    super(CollectionLogCache.STORAGE);
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new CollectionLogCache();
    }
    return this.instance;
  }
}

export default CollectionLogCache;
