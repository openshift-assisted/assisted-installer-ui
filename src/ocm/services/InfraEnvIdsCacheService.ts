const CACHE_KEY = 'infra-env-ids-cache';

const update = (cache: Record<string, string>): void => {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

const read = (): Record<string, string> => {
  const EMPTY_CACHE = '{}';
  const cache = localStorage.getItem(CACHE_KEY) || EMPTY_CACHE;

  try {
    return JSON.parse(cache) as Record<string, string>;
  } catch {
    return {};
  }
};

const InfraEnvIdsCacheService: Storage = {
  key(index: number): string | null {
    const cache = read();
    return Object.keys(cache)[index];
  },

  get length(): number {
    const cache = read();
    return Object.keys(cache).length;
  },

  clear(): void {
    localStorage.removeItem(CACHE_KEY);
  },

  getItem(key: string): string | null {
    if (!key) {
      return null;
    }

    const cache = read();
    return cache[key] || null;
  },

  removeItem(key: string): void {
    if (!key) {
      return;
    }

    const cache = read();
    delete cache[key];
    update(cache);
  },

  setItem(key: string, value: string): void {
    if (!key || !value) {
      return;
    }

    const cache = read();
    cache[key] = value;
    update(cache);
  },
};

export default InfraEnvIdsCacheService;
