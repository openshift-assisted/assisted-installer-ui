import * as Yup from 'yup';

import {
  FormViewNetworkWideValues,
  FormViewHostsValues,
  ProtocolVersion,
} from '../../data/dataTypes';
import { macAddressValidationSchema } from '../../../../../../common';
import { showIpv4, showIpv6 } from '../../data/protocolVersion';
import { getInMachineNetworkValidationSchema } from '../FormViewNetworkWide/formViewNetworkWideValidationSchema';
import {
  getUniqueValidationSchema,
  UniqueStringArrayExtractor,
  getIpIsNotNetworkOrBroadcastAddressSchema,
} from '../../commonValidationSchemas';
import { getMachineNetworkCidr } from '../../data/machineNetwork';
const requiredMsg = 'A value is required';

const getAllIpv4Addresses: UniqueStringArrayExtractor<FormViewHostsValues> = (
  values: FormViewHostsValues,
) => values.hosts.map((host) => host.ips.ipv4);

const getAllIpv6Addresses: UniqueStringArrayExtractor<FormViewHostsValues> = (
  values: FormViewHostsValues,
) => values.hosts.map((host) => host.ips.ipv6);

const getAllMacAddresses: UniqueStringArrayExtractor<FormViewHostsValues> = (
  values: FormViewHostsValues,
) => values.hosts.map((host) => host.macAddress);

const getHostValidationSchema = (networkWideValues: FormViewNetworkWideValues) =>
  Yup.object({
    macAddress: macAddressValidationSchema
      .required(requiredMsg)
      .concat(getUniqueValidationSchema(getAllMacAddresses)),
    ips: Yup.object({
      ipv4: showIpv4(networkWideValues.protocolType)
        ? getInMachineNetworkValidationSchema(
            ProtocolVersion.ipv4,
            networkWideValues.ipConfigs['ipv4'].machineNetwork,
          )
            .required(requiredMsg)
            .concat(getUniqueValidationSchema(getAllIpv4Addresses))
            .concat(
              getIpIsNotNetworkOrBroadcastAddressSchema(
                ProtocolVersion.ipv4,
                getMachineNetworkCidr(networkWideValues.ipConfigs['ipv4'].machineNetwork),
              ),
            )
        : Yup.string(),
      ipv6: showIpv6(networkWideValues.protocolType)
        ? getInMachineNetworkValidationSchema(
            ProtocolVersion.ipv6,
            networkWideValues.ipConfigs['ipv6'].machineNetwork,
          )
            .required(requiredMsg)
            .concat(getUniqueValidationSchema(getAllIpv6Addresses))
            .concat(
              getIpIsNotNetworkOrBroadcastAddressSchema(
                ProtocolVersion.ipv6,
                getMachineNetworkCidr(networkWideValues.ipConfigs['ipv6'].machineNetwork),
              ),
            )
        : Yup.string(),
    }),
  });

export const getFormViewHostsValidationSchema = (networkWideValues: FormViewNetworkWideValues) => {
  return Yup.object().shape({
    hosts: Yup.array(getHostValidationSchema(networkWideValues)),
  });
};
