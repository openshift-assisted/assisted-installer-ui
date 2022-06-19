import { Address4, Address6 } from 'ip-address';
import { isInSubnet } from 'is-in-subnet';
import * as Yup from 'yup';

const LOCAL_HOST_IP = {
  ipv4: '127.0.0.0',
  ipv6: '::1',
};

const CATCH_ALL_IP = {
  ipv4: '0.0.0.0',
  ipv6: '0000::',
};

export type UniqueStringArrayExtractor<FormValues> = (
  values: FormValues,
  context: Yup.TestContext,
  value: string,
) => string[] | undefined;

export const getUniqueValidationSchema = <FormValues,>(
  uniqueStringArrayExtractor: UniqueStringArrayExtractor<FormValues>,
) => {
  return Yup.string().test('unique', 'Value must be unique', function (value: string) {
    if (!this.options.context || !('values' in this.options.context)) {
      return this.createError({
        message: 'Unexpected error: Yup test context should contain form values',
      });
    }
    const values = uniqueStringArrayExtractor(this.options.context['values'], this, value);
    if (!values) {
      return this.createError({
        message: 'Unexpected error: Failed to get values to test uniqueness',
      });
    }
    return values.filter((currentValue) => currentValue === value).length === 1;
  });
};

export const getIpAddressValidationSchema = (protocolVersion: 'ipv4' | 'ipv6') => {
  const protocolVersionLabel = protocolVersion === 'ipv4' ? 'IPv4' : 'IPv6';
  return Yup.string().test(
    protocolVersion,
    `Value \${value} is not a valid ${protocolVersionLabel} address`,
    function (value) {
      if (!value) {
        return true;
      }
      try {
        const address = protocolVersion === 'ipv4' ? new Address4(value) : new Address6(value);
        if (address.parsedSubnet) {
          //ip-address package treats cidr addresses as valid so need to verify it isn't a cidr
          return false;
        }
      } catch (e) {
        return false;
      }
      return true;
    },
  );
};

export const compareIPV6Addresses = (address1: Address6, address2: Address6) => {
  return JSON.stringify(address1.toByteArray()) === JSON.stringify(address2.toByteArray());
};

export const isNotLocalHostIPAddress = (protocolVersion: 'ipv4' | 'ipv6') => {
  return Yup.string().test(
    'is-local-host',
    `Provided IP address is not a correct address for an interface.`,
    function (value) {
      if (!value) {
        return true;
      }
      try {
        if (protocolVersion === 'ipv6') {
          if (compareIPV6Addresses(new Address6(LOCAL_HOST_IP.ipv6), new Address6(value))) {
            return false;
          }
        } else {
          if (value === LOCAL_HOST_IP.ipv4) {
            return false;
          }
        }
      } catch (e) {
        return true;
      }
      return true;
    },
  );
};

export const isNotCatchAllIPAddress = (protocolVersion: 'ipv4' | 'ipv6') => {
  return Yup.string().test(
    'is-catch-all',
    `Provided IP address is not a correct address for an interface.`,
    function (value) {
      if (!value) {
        return true;
      }
      try {
        if (protocolVersion === 'ipv6') {
          if (compareIPV6Addresses(new Address6(CATCH_ALL_IP.ipv6), new Address6(value))) {
            return false;
          }
        } else {
          if (value === CATCH_ALL_IP.ipv4) {
            return false;
          }
        }
      } catch (e) {
        return true;
      }
      return true;
    },
  );
};

export const getIpAddressInSubnetValidationSchema = (
  protocolVersion: 'ipv4' | 'ipv6',
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
