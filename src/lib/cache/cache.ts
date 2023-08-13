interface CacheStorage<T> {
  [key: string]: CacheItem<T>;
}

interface CacheItem<T> {
  timestamp: number;
  value: T;
}

class Cache<T> {
  private static readonly DEFAULT_TTL = 300 * 1000;

  public name = '';

  constructor(private storage: CacheStorage<T>, private ttl = Cache.DEFAULT_TTL) {}

  public add(key: string, value: T) {
    this.storage[key] = {
      timestamp: Date.now(),
      value,
    };
  }

  public get(key: string) {
    const cacheItem = this.storage[key];
    if (!cacheItem) {
      return undefined;
    }

    const timeDelta = Date.now() - cacheItem.timestamp;
    if (timeDelta > this.ttl) {
      this.remove(key);
      return undefined;
    }

    return cacheItem;
  }

  public remove(key: string) {
    delete this.storage[key];
  }

  public exists(key: string) {
    return !!this.storage[key];
  }
}

export { CacheStorage };
export default Cache;
