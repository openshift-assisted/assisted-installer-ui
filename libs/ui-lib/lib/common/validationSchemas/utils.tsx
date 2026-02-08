import * as Yup from 'yup';
import { Address4, Address6 } from 'ip-address';
import { DNS_NAME_REGEX } from './regexes';

export const isIPorDN = (value?: string, dnsRegex = DNS_NAME_REGEX) => {
  if ((value as string).match(dnsRegex)) {
    return true;
  } else if (value) {
    return Address4.isValid(value) || Address6.isValid(value);
  } else {
    return false;
  }
};

// Helpers to classify literal IPs more robustly
export const isIPv4Address = (ip?: string) => {
  if (!ip) return false;
  return ip.includes('.') && Address4.isValid(ip);
};

export const isIPv6Address = (ip?: string) => {
  if (!ip) return false;
  return ip.includes(':') && Address6.isValid(ip);
};

export const alwaysRequired = (message?: string) =>
  Yup.string().test(
    'always-required',
    message || 'The value is required.',
    (value?: string): boolean => !!value,
  );

export const getArrayIndexFromPath = (path: string): number => {
  const match = path.match(/\[(\d+)\][^\[]*$/); // Prefer the last [...] occurrence for nested array paths like "foo[0].bar[1].ip"
  return match ? parseInt(match[1], 10) : NaN;
};
