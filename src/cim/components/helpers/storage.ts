import { convertToBaseValue } from './units';

export const getStorageSizeGB = (def: number, actual?: string): number => {
  if (!actual) {
    return def;
  }

  const base = convertToBaseValue(actual);
  if (!base) {
    return def;
  }

  return base / 1000 / 1000 / 1000;
};
