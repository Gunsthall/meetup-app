/**
 * Mock Redis Service for Development
 * Use this when Redis is not available
 */

interface MockStore {
  [key: string]: {
    value: string;
    expiresAt: number;
  };
}

class MockRedis {
  private store: MockStore = {};

  async connect() {
    console.log('Mock Redis: Connected (in-memory storage)');
  }

  async quit() {
    console.log('Mock Redis: Disconnected');
  }

  get isOpen() {
    return true;
  }

  async setEx(key: string, seconds: number, value: string): Promise<void> {
    this.store[key] = {
      value,
      expiresAt: Date.now() + seconds * 1000,
    };
    console.log(`Mock Redis: SET ${key} (expires in ${seconds}s)`);
  }

  async get(key: string): Promise<string | null> {
    const item = this.store[key];
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiresAt) {
      delete this.store[key];
      return null;
    }

    return item.value;
  }

  async del(key: string): Promise<void> {
    delete this.store[key];
    console.log(`Mock Redis: DEL ${key}`);
  }

  async exists(key: string): Promise<number> {
    const item = this.store[key];
    if (!item) return 0;

    // Check if expired
    if (Date.now() > item.expiresAt) {
      delete this.store[key];
      return 0;
    }

    return 1;
  }

  on(event: string, callback: Function) {
    if (event === 'connect') {
      setTimeout(() => callback(), 0);
    }
  }
}

export const redis = new MockRedis();

export async function initRedis() {
  await redis.connect();
}

export async function closeRedis() {
  await redis.quit();
}
