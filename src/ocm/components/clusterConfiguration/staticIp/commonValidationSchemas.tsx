import { Address4, Address6 } from 'ip-address';
import { isInSubnet } from 'is-in-subnet';
import * as Yup from 'yup';

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
