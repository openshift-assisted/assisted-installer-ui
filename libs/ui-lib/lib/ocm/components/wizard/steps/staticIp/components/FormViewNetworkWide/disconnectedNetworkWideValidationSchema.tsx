import * as Yup from 'yup';
import { IpConfig, FormViewNetworkWideValues, Cidr } from '../../data';
import {
  detectProtocolVersionFromIp,
  getDnsMatchingSubnetFamilyValidationSchema,
  getFamilyAgnosticIpValidationSchema,
  isNotReservedHostIPAddress,
} from '../../commonValidationSchemas';
import {
  buildNetworkWideValidationSchema,
  getInMachineNetworkValidationSchema,
  getIsNotNetworkOrBroadcastAddressSchema,
  getIPValidationSchema,
  MAX_PREFIX_LENGTH,
  MIN_PREFIX_LENGTH,
  validateNumber,
  MAX_VLAN_ID,
  MUST_BE_A_NUMBER,
} from './formViewNetworkWideValidationSchema';

const REQUIRED_MESSAGE = 'A value is required';

const transformNumber = (originalValue: number) => {
  return isNaN(originalValue) ? null : originalValue;
};

const getDisconnectedSingleStackMachineNetworkSchema = (subnetIp: string) =>
  Yup.object<Cidr>().shape({
    ip: getFamilyAgnosticIpValidationSchema().required(REQUIRED_MESSAGE),
    prefixLength: Yup.number()
      .required('Prefix length is required')
      .min(MIN_PREFIX_LENGTH, `Prefix length must be more than or equal to ${MIN_PREFIX_LENGTH}`)
      .test(
        'prefix-length-family',
        `Prefix length must be less than or equal to ${MAX_PREFIX_LENGTH.ipv6}`,
        (prefixLength) => {
          if (prefixLength === undefined || prefixLength === null) {
            return true;
          }
          const family = detectProtocolVersionFromIp(subnetIp);
          const max = family ? MAX_PREFIX_LENGTH[family] : MAX_PREFIX_LENGTH.ipv6;
          return prefixLength <= max;
        },
      )
      .transform(transformNumber) as Yup.NumberSchema,
  });

const getDisconnectedSingleStackIpConfigSchema = (ipConfig: IpConfig) => {
  const subnetIp = ipConfig.machineNetwork.ip;
  const family = detectProtocolVersionFromIp(subnetIp);

  const gatewaySchema = family
    ? getIPValidationSchema(family)
        .concat(getInMachineNetworkValidationSchema(family, ipConfig.machineNetwork))
        .concat(getIsNotNetworkOrBroadcastAddressSchema(family, ipConfig.machineNetwork))
    : getFamilyAgnosticIpValidationSchema()
        .required(REQUIRED_MESSAGE)
        .concat(isNotReservedHostIPAddress());

  return Yup.object({
    machineNetwork: getDisconnectedSingleStackMachineNetworkSchema(subnetIp),
    gateway: gatewaySchema,
  });
};

const buildDisconnectedSingleStackValidationSchema = (values: FormViewNetworkWideValues) => {
  const subnetIp = values.ipConfigs.ipv4.machineNetwork.ip;

  return Yup.object({
    useVlan: Yup.boolean(),
    vlanId: Yup.mixed().when('useVlan', {
      is: (useVlan: boolean) => useVlan,
      then: () =>
        Yup.number()
          .required(MUST_BE_A_NUMBER)
          .min(1, `Must be more than or equal to 1`)
          .max(MAX_VLAN_ID, `Must be less than or equal to ${MAX_VLAN_ID}`)
          .test('not-number', MUST_BE_A_NUMBER, () => validateNumber(values.vlanId))
          .nullable()
          .transform(transformNumber) as Yup.NumberSchema,
    }),
    protocolType: Yup.string(),
    dns: getDnsMatchingSubnetFamilyValidationSchema(subnetIp),
    ipConfigs: Yup.object({
      ipv4: getDisconnectedSingleStackIpConfigSchema(values.ipConfigs.ipv4),
      ipv6: Yup.object<IpConfig>(),
    }),
  });
};

export const disconnectedNetworkWideValidationSchema = Yup.lazy(
  (values: FormViewNetworkWideValues) => {
    if (values.protocolType === 'dualStack') {
      return buildNetworkWideValidationSchema(values);
    }
    return buildDisconnectedSingleStackValidationSchema(values);
  },
);
