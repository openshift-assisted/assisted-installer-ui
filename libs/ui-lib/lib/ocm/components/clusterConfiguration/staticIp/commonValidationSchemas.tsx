import { Address4, Address6 } from 'ip-address';
import { isInSubnet } from 'is-in-subnet';
import * as Yup from 'yup';
import { getAddressObject } from './data/protocolVersion';
import { ProtocolVersion } from './data/dataTypes';
import { getDuplicates } from '../../../../common';

const RESERVED_IPS = ['127.0.0.0', '127.0.0.1', '0.0.0.0', '255.255.255.255'];

export type UniqueStringArrayExtractor<FormValues> = (
  values: FormValues,
  context: Yup.TestContext,
  value: string,
) => string[] | undefined;

export const getUniqueValidationSchema = <FormValues,>(
  uniqueStringArrayExtractor: UniqueStringArrayExtractor<FormValues>,
) => {
  return Yup.string().test(
    'unique',
    'Value must be unique',
    (value, testContext: Yup.TestContext) => {
      const context = testContext.options.context as Yup.TestContext & { values?: FormValues };
      if (!context || !context.values) {
        return testContext.createError({
          message: 'Unexpected error: Yup test context should contain form values',
        });
      }

      const values = uniqueStringArrayExtractor(context.values, testContext, value as string);

      if (!values) {
        return testContext.createError({
          message: 'Unexpected error: Failed to get values to test uniqueness',
        });
      }
      return values.filter((currentValue) => currentValue === value).length === 1;
    },
  );
};

const isValidIPv4Address = (addressStr: string) => {
  try {
    // ip-address package treats cidr addresses as valid so need to verify it isn't a cidr
    // Can't use Address4.isValid()
    const address = new Address4(addressStr);
    return !address.parsedSubnet;
  } catch (e) {
    return false;
  }
};

const isValidIPv6Address = (addressStr: string) => {
  try {
    // ip-address package treats cidr addresses as valid so need to verify it isn't a cidr
    // Can't use Address6.isValid()
    const address = new Address6(addressStr);
    return !address.parsedSubnet;
  } catch (e) {
    return false;
  }
};

const isValidAddress = (addressStr: string, protocolVersion?: ProtocolVersion) => {
  if (protocolVersion === undefined) {
    return isValidIPv4Address(addressStr) || isValidIPv6Address(addressStr);
  }
  return protocolVersion === ProtocolVersion.ipv4
    ? isValidIPv4Address(addressStr)
    : isValidIPv6Address(addressStr);
};

const isReservedAddress = (addressStr: string, protocolVersion?: ProtocolVersion) => {
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

export const isReservedIpv6Address = (ipv6Address: Address6) => {
  return ipv6Address.isLoopback() || ipv6Address.isMulticast();
};

function areNotReservedAdresses(value: unknown, protocolVersion?: ProtocolVersion): boolean {
  if (!value) {
    return true;
  }
  // The field may admit multiple values as a comma-separated string
  const addresses = (value as string).split(',');
  return addresses.every((address) => !isReservedAddress(address, protocolVersion));
}

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

export const getIpIsNotNetworkOrBroadcastAddressSchema = (
  protocolVersion: ProtocolVersion,
  subnet: string,
) => {
  return Yup.string().test(
    'is-not-network-or-broadcast',
    `The IP address must not match the network or broadcast address`,
    (value) => {
      const subnetAddr = getAddressObject(subnet, protocolVersion);
      if (!subnetAddr) {
        return false;
      } else {
        const subnetStart = subnetAddr?.startAddress().correctForm();
        const subnetEnd = subnetAddr?.endAddress().correctForm();
        return !(value === subnetStart || value === subnetEnd);
      }
    },
  );
};
