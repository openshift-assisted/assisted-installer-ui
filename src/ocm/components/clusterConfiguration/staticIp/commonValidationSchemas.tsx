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
  return Yup.string().test('unique', 'Value must be unique', function (value: string) {
    const context = this.options.context as Yup.TestContext & { values?: FormValues };
    if (!context || !context.values) {
      return this.createError({
        message: 'Unexpected error: Yup test context should contain form values',
      });
    }
    const values = uniqueStringArrayExtractor(context.values, this, value);
    if (!values) {
      return this.createError({
        message: 'Unexpected error: Failed to get values to test uniqueness',
      });
    }
    return values.filter((currentValue) => currentValue === value).length === 1;
  });
};

const isValidAddress = (protocolVersion: ProtocolVersion, addressStr: string) => {
  try {
    const address =
      protocolVersion === ProtocolVersion.ipv4
        ? new Address4(addressStr)
        : new Address6(addressStr);
    // ip-address package treats cidr addresses as valid so need to verify it isn't a cidr
    return !address.parsedSubnet;
  } catch (e) {
    return false;
  }
};

const isReservedAddress = (ip: string, protocolVersion: ProtocolVersion) => {
  try {
    if (protocolVersion === ProtocolVersion.ipv4) {
      return RESERVED_IPS.includes(ip);
    } else {
      return isReservedIpv6Address(new Address6(ip)) !== undefined;
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
    function (value: string) {
      if (!value) {
        return true;
      }
      return isValidAddress(protocolVersion, value);
    },
  );
};

export const getMultipleIpAddressValidationSchema = (protocolVersion: ProtocolVersion) => {
  const protocolVersionLabel = protocolVersion === ProtocolVersion.ipv4 ? 'IPv4' : 'IPv6';
  return Yup.string().test(
    protocolVersion,
    ({ value }) => {
      const addresses = (value as string).split(',');
      const invalidAddresses = addresses.filter(
        (address) => !isValidAddress(protocolVersion, address),
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
    function (value: string) {
      if (!value) {
        return true;
      }
      const addresses: string[] = value.split(',');
      const duplicates = getDuplicates(addresses);
      if (duplicates.length !== 0) {
        return false;
      }

      return addresses.every((address) => isValidAddress(protocolVersion, address));
    },
  );
};

export const isReservedIpv6Address = (ipv6Address: Address6) => {
  return ipv6Address.isLoopback() || ipv6Address.isMulticast();
};

export const isNotReservedHostIPAddress = (
  protocolVersion: ProtocolVersion,
  isDnsAddress = false,
) => {
  const textForAddress = isDnsAddress ? 'a DNS' : 'an interface';
  return Yup.string().test(
    'is-not-reserved-address',
    ({ value }) => {
      const addresses = (value as string).split(',');
      if (addresses.length === 1) {
        return `Provided IP address is not a correct address for ${textForAddress}.`;
      }

      const reservedAddresses = addresses.filter((address) => {
        return isReservedAddress(address, protocolVersion);
      });
      return `Provided IP addresses ${reservedAddresses.join(
        ', ',
      )} are not correct addresses for ${textForAddress}.`;
    },
    function (value) {
      if (!value) {
        return true;
      }
      // The field may admit multiple values as a comma-separated string
      const addresses = (value as string).split(',');
      return addresses.every((address) => !isReservedAddress(address, protocolVersion));
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
    function (value) {
      if (!value) {
        return true;
      }
      const ipValidationSchema = getIpAddressValidationSchema(protocolVersion);
      try {
        ipValidationSchema.validateSync(value);
      } catch (err) {
        const error = err as { message: string };
        return this.createError({ message: error.message });
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
