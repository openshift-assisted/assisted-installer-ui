import { Address4, Address6 } from 'ip-address';
import { ProtocolVersion, StaticProtocolType } from './dataTypes';

export const showIpv4 = (protocolType: StaticProtocolType) => {
  return protocolType !== 'ipv6';
};

export const showIpv6 = (protocolType: StaticProtocolType) => {
  return protocolType !== 'ipv4';
};

export const showProtocolVersion = (
  protocolType: StaticProtocolType,
  protocolVersion: ProtocolVersion,
) => {
  if (protocolVersion === ProtocolVersion.ipv4) {
    return showIpv4(protocolType);
  }
  return showIpv6(protocolType);
};

export const getShownProtocolVersions = (protocolType: StaticProtocolType): ProtocolVersion[] => {
  if (protocolType === 'dualStack') {
    return [ProtocolVersion.ipv4, ProtocolVersion.ipv6];
  }
  if (protocolType === 'ipv6') {
    return [ProtocolVersion.ipv6];
  }
  return [ProtocolVersion.ipv4];
};

export const getProtocolVersionLabel = (protocolVersion: ProtocolVersion) =>
  protocolVersion === ProtocolVersion.ipv4 ? 'IPv4' : 'IPv6';

export const getAddressObject = (
  ip: string,
  protocolVersion: ProtocolVersion,
): Address4 | Address6 | null => {
  if (protocolVersion === ProtocolVersion.ipv4 && Address4.isValid(ip)) {
    return new Address4(ip);
  }
  if (protocolVersion === ProtocolVersion.ipv6 && Address6.isValid(ip)) {
    return new Address6(ip);
  }
  return null;
};
