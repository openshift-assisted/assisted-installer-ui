import * as Yup from 'yup';
import { Cidr, IpConfig, IpConfigs, ProtocolVersion, StaticProtocolType } from './types';
import { getDuplicates } from '../ui';
import { Address4, Address6 } from 'ip-address';
import { getAddressObject, showProtocolVersion } from './protocolVersion';
import { isInSubnet } from 'is-in-subnet';
import { getMachineNetworkCidr } from './machineNetwork';

const REQUIRED_MESSAGE = 'A value is required';
const MUST_BE_A_NUMBER = 'Must be a number';

export const MIN_PREFIX_LENGTH = 1;
export const MAX_PREFIX_LENGTH = {
  ipv4: 32,
  ipv6: 128,
};

export const MIN_VLAN_ID = 1;
export const MAX_VLAN_ID = 4094;

const ONLY_DIGITS_REGEX = /^\d+$/;
const RESERVED_IPS = ['127.0.0.0', '127.0.0.1', '0.0.0.0', '255.255.255.255'];

const validateNumber = (vlanId: number | '') => {
  //We need to validate that value is a number(without letters) and is not an exponential number (ex: 1e2)
  return new RegExp(ONLY_DIGITS_REGEX).test((vlanId || '').toString());
};

const transformNumber = (originalValue: number) => {
  return isNaN(originalValue) ? null : originalValue;
};

export const VlanIdValidationSchema = (vlanId: number | '') =>
  Yup.number()
    .required(REQUIRED_MESSAGE)
    .min(1, `Must be more than or equal to 1`)
    .max(MAX_VLAN_ID, `Must be less than or equal to ${MAX_VLAN_ID}`)
    .test('not-number', MUST_BE_A_NUMBER, () => validateNumber(vlanId))
    .nullable()
    .transform(transformNumber) as Yup.NumberSchema;

export const isReservedIpv6Address = (ipv6Address: Address6) => {
  return ipv6Address.isLoopback() || ipv6Address.isMulticast();
};

export const isReservedAddress = (addressStr: string, protocolVersion?: ProtocolVersion) => {
  try {
    if (
      (protocolVersion === undefined && isValidIPv4Address(addressStr)) ||
      protocolVersion === ProtocolVersion.ipv4
    ) {
      return RESERVED_IPS.includes(addressStr);
    } else {
      return isReservedIpv6Address(new Address6(addressStr));
    }
  } catch (e) {
    return false;
  }
};

export const areNotReservedAdresses = (
  value: unknown,
  protocolVersion?: ProtocolVersion,
): boolean => {
  if (!value) {
    return true;
  }
  // The field may admit multiple values as a comma-separated string
  const addresses = (value as string).split(',');
  return addresses.every((address) => !isReservedAddress(address, protocolVersion));
};

export const isValidIPv4Address = (addressStr: string) => {
  try {
    // ip-address package treats cidr addresses as valid so need to verify it isn't a cidr
    // Can't use Address4.isValid()
    const address = new Address4(addressStr);
    return !address.parsedSubnet;
  } catch (e) {
    return false;
  }
};

export const isValidIPv6Address = (addressStr: string) => {
  try {
    // ip-address package treats cidr addresses as valid so need to verify it isn't a cidr
    // Can't use Address6.isValid()
    const address = new Address6(addressStr);
    return !address.parsedSubnet;
  } catch (e) {
    return false;
  }
};

export const isValidAddress = (addressStr: string, protocolVersion?: ProtocolVersion) => {
  if (protocolVersion === undefined) {
    return isValidIPv4Address(addressStr) || isValidIPv6Address(addressStr);
  }
  return protocolVersion === ProtocolVersion.ipv4
    ? isValidIPv4Address(addressStr)
    : isValidIPv6Address(addressStr);
};

export const getMultipleIpAddressValidationSchema = (protocolVersion?: ProtocolVersion) => {
  const validationId = protocolVersion === undefined ? 'is-ipv4-or-ipv6-csv' : protocolVersion;
  const protocolVersionLabel =
    protocolVersion === undefined
      ? 'IPv4 or IPv6'
      : protocolVersion === ProtocolVersion.ipv4
      ? 'IPv4'
      : 'IPv6';
  return Yup.string().test(
    validationId,
    ({ value }) => {
      const addresses = (value as string).split(',');
      const invalidAddresses = addresses.filter(
        (address) => !isValidAddress(address, protocolVersion),
      );
      const displayValue = invalidAddresses.join(', ');
      if (invalidAddresses.length === 1) {
        return `Value ${displayValue} is not a valid ${protocolVersionLabel} address`;
      } else if (invalidAddresses.length > 1) {
        return `The values ${displayValue} are not valid ${protocolVersionLabel} addresses`;
      }
      // If all addresses are valid, then there must be duplicated addresses
      const duplicates = getDuplicates(addresses);
      return `The following IP addresses are duplicated: ${duplicates.join(',')}`;
    },
    (value?: string) => {
      if (!value) {
        return true;
      }
      const addresses: string[] = value.split(',');
      const duplicates = getDuplicates(addresses);
      if (duplicates.length !== 0) {
        return false;
      }

      return addresses.every((address) => isValidAddress(address, protocolVersion));
    },
  );
};

export const isNotReservedHostDNSAddress = (protocolVersion?: ProtocolVersion) => {
  return Yup.string().test(
    'is-not-reserved-dns-address',
    ({ value }) => {
      const addresses = (value as string).split(',');
      if (addresses.length === 1) {
        return `The provided IP address is not a valid DNS address.`;
      }

      const reservedAddresses = addresses.filter((address) => {
        return isReservedAddress(address, protocolVersion);
      });
      return `The provided IP addresses ${reservedAddresses.join(
        ', ',
      )} are not valid DNS addresses.`;
    },
    (value) => areNotReservedAdresses(value, protocolVersion),
  );
};

export const getDNSValidationSchema = (protocolType: StaticProtocolType) => {
  if (protocolType === 'dualStack') {
    return getMultipleIpAddressValidationSchema()
      .required(REQUIRED_MESSAGE)
      .concat(isNotReservedHostDNSAddress());
  }
  return getMultipleIpAddressValidationSchema(ProtocolVersion.ipv4)
    .required(REQUIRED_MESSAGE)
    .concat(isNotReservedHostDNSAddress(ProtocolVersion.ipv4));
};

export const getIpAddressValidationSchema = (protocolVersion: ProtocolVersion) => {
  const protocolVersionLabel = protocolVersion === ProtocolVersion.ipv4 ? 'IPv4' : 'IPv6';
  return Yup.string().test(
    protocolVersion,
    `Value \${value} is not a valid ${protocolVersionLabel} address`,
    (value?: string) => {
      if (!value) {
        return true;
      }
      return isValidAddress(value, protocolVersion);
    },
  );
};

export const getIpAddressInSubnetValidationSchema = (
  protocolVersion: ProtocolVersion,
  subnet: string,
) => {
  return Yup.string().test(
    'is-in-subnet',
    `IP Address is outside of the machine network ${subnet}`,
    (value, testContext: Yup.TestContext) => {
      if (!value) {
        return true;
      }
      const ipValidationSchema = getIpAddressValidationSchema(protocolVersion);
      try {
        ipValidationSchema.validateSync(value);
      } catch (err) {
        const error = err as { message: string };
        return testContext.createError({ message: error.message });
      }
      try {
        const inSubnet = isInSubnet(value, subnet);
        return inSubnet;
      } catch (err) {
        //if isInSubnet fails it means the machine network cidr isn't valid and this validation is irrelevant
        return true;
      }
    },
  );
};

export const getInMachineNetworkValidationSchema = (
  protocolVersion: ProtocolVersion,
  machineNetwork: Cidr,
) => {
  return getIpAddressInSubnetValidationSchema(
    protocolVersion,
    getMachineNetworkCidr(machineNetwork),
  );
};

export const getIpIsNotNetworkOrBroadcastAddressSchema = (
  protocolVersion: ProtocolVersion,
  subnet: string,
) => {
  return Yup.string().test(
    'is-not-network-or-broadcast',
    `The IP address must not match the network or broadcast address`,
    (value) => {
      // Allow both addresses for IPv4 /31 subnets (RFC 3021)
      if (protocolVersion === ProtocolVersion.ipv4 && subnet.endsWith('/31')) {
        return true;
      }
      const subnetAddr = getAddressObject(subnet, protocolVersion);
      if (!subnetAddr) {
        return true;
      } else {
        const subnetStart = subnetAddr?.startAddress().correctForm();
        const subnetEnd = subnetAddr?.endAddress().correctForm();
        return !(value === subnetStart || value === subnetEnd);
      }
    },
  );
};

export const getIsNotNetworkOrBroadcastAddressSchema = (
  protocolVersion: ProtocolVersion,
  machineNetwork: Cidr,
) => {
  return getIpIsNotNetworkOrBroadcastAddressSchema(
    protocolVersion,
    getMachineNetworkCidr(machineNetwork),
  );
};

const getMachineNetworkValidationSchema = (protocolVersion: ProtocolVersion) =>
  Yup.object<Cidr>().shape({
    ip: getIPValidationSchema(protocolVersion),
    prefixLength: Yup.number()
      .required('Prefix length is required')
      .min(1, `Prefix length must be more than or equal to 1`)
      .max(
        MAX_PREFIX_LENGTH[protocolVersion],
        `Prefix length must be less than or equal to ${MAX_PREFIX_LENGTH[protocolVersion]}`,
      )
      .nullable()
      .transform(transformNumber) as Yup.NumberSchema, //add casting to not get typescript error caused by nullable
  });

export const isNotReservedHostIPAddress = (protocolVersion?: ProtocolVersion) => {
  return Yup.string().test(
    'is-not-reserved-ip-address',
    ({ value }) => {
      const addresses = (value as string).split(',');
      if (addresses.length === 1) {
        return `The provided IP address is not a correct address for an interface.`;
      }

      const reservedAddresses = addresses.filter((address) => {
        return isReservedAddress(address, protocolVersion);
      });
      return `The provided IP addresses ${reservedAddresses.join(
        ', ',
      )} are not correct addresses for an interface.`;
    },
    (value) => areNotReservedAdresses(value, protocolVersion),
  );
};

const getIPValidationSchema = (protocolVersion: ProtocolVersion) => {
  return getIpAddressValidationSchema(protocolVersion)
    .required(REQUIRED_MESSAGE)
    .concat(isNotReservedHostIPAddress(protocolVersion));
};

const getAddressDataValidationSchema = (protocolVersion: ProtocolVersion, ipConfig: IpConfig) => {
  return Yup.object({
    machineNetwork: getMachineNetworkValidationSchema(protocolVersion),
    gateway: getIPValidationSchema(protocolVersion)
      .concat(getInMachineNetworkValidationSchema(protocolVersion, ipConfig.machineNetwork))
      .concat(getIsNotNetworkOrBroadcastAddressSchema(protocolVersion, ipConfig.machineNetwork)),
  });
};

export const ipConfigsValidationSchemas = (
  ipConfigs: IpConfigs,
  protocolType: StaticProtocolType,
) =>
  Yup.object({
    ipv4: getAddressDataValidationSchema(ProtocolVersion.ipv4, ipConfigs.ipv4),
    ipv6: showProtocolVersion(protocolType, ProtocolVersion.ipv6)
      ? getAddressDataValidationSchema(ProtocolVersion.ipv6, ipConfigs.ipv6)
      : Yup.object<IpConfig>(),
  });
