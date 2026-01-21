import { convertToBaseValue } from './units';

export const getStorageSizeGiB = (def: number, actual?: string): number => {
  if (!actual) {
    return def;
  }

  const base = convertToBaseValue(actual);
  if (!base) {
    return def;
  }

  return base / 1024 / 1024 / 1024;
};
