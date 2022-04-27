import * as Yup from 'yup';

import { IpConfig, ProtocolVersion, FormViewNetworkWideValues, Cidr } from '../../data/dataTypes';

import { getShownProtocolVersions, showProtocolVersion } from '../../data/protocolVersion';
import { getMachineNetworkCidr } from '../../data/machineNetwork';
import {
  getIpAddressInSubnetValidationSchema,
  getIpAddressValidationSchema,
} from '../../commonValidationSchemas';
const REQUIRED_MESSAGE = 'A value is required';

const MAX_PREFIX_LENGTH = {
  ipv4: 32,
  ipv6: 128,
};

export const getInMachineNetworkValidationSchema = (
  protocolVersion: 'ipv4' | 'ipv6',
  machineNetwork: Cidr,
) => {
  return getIpAddressInSubnetValidationSchema(
    protocolVersion,
    getMachineNetworkCidr(machineNetwork),
  );
};

const getMachineNetworkValidationSchema = (protocolVersion: ProtocolVersion) =>
  Yup.object<Cidr>().shape({
    ip: getIpAddressValidationSchema('dns', protocolVersion).required(REQUIRED_MESSAGE),
    prefixLength: Yup.number()
      .required(REQUIRED_MESSAGE)
      .min(1, `Must be more than or equal to 1`)
      .max(
        MAX_PREFIX_LENGTH[protocolVersion],
        `Must be less than or equal to ${MAX_PREFIX_LENGTH[protocolVersion]}`,
      ),
  });

const getAddressDataValidationSchema = (protocolVersion: ProtocolVersion, ipConfig: IpConfig) => {
  return Yup.object().shape<IpConfig>({
    dns: getIpAddressValidationSchema('dns', protocolVersion).required(REQUIRED_MESSAGE),
    machineNetwork: getMachineNetworkValidationSchema(protocolVersion),
    gateway: Yup.string()
      .required(REQUIRED_MESSAGE)
      .concat(getInMachineNetworkValidationSchema(protocolVersion, ipConfig.machineNetwork)),
  });
};

export const networkWideValidationSchema = Yup.lazy<FormViewNetworkWideValues>(
  (values: FormViewNetworkWideValues) => {
    const ipConfigsValidationSchemas = Yup.object().shape({
      ipv4: getAddressDataValidationSchema('ipv4', values.ipConfigs.ipv4),
      ipv6: showProtocolVersion(values.protocolType, 'ipv6')
        ? getAddressDataValidationSchema('ipv6', values.ipConfigs.ipv6)
        : Yup.object<IpConfig>(),
    });
    for (const protocolVersion of getShownProtocolVersions(values.protocolType)) {
      ipConfigsValidationSchemas[protocolVersion] = getAddressDataValidationSchema(
        protocolVersion,
        values.ipConfigs[protocolVersion],
      );
    }
    return Yup.object().shape({
      useVlan: Yup.boolean(),
      vlanId: Yup.number().when('useVlan', {
        is: true,
        then: Yup.number().required(REQUIRED_MESSAGE),
      }),
      protocolType: Yup.string(),
      ipConfigs: ipConfigsValidationSchemas,
    });
  },
);
