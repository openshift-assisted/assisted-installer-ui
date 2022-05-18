import * as Yup from 'yup';

import {
  FormViewHost,
  HostIps,
  FormViewNetworkWideValues,
  FormViewHostsValues,
} from '../../data/dataTypes';
import { macAddressValidationSchema } from '../../../../../../common';
import { showIpv4, showIpv6 } from '../../data/protocolVersion';
import { getInMachineNetworkValidationSchema } from '../FormViewNetworkWide/formViewNetworkWideValidationSchema';
import {
  getUniqueValidationSchema,
  UniqueStringArrayExtractor,
} from '../../commonValidationSchemas';
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
  Yup.object().shape<FormViewHost>({
    macAddress: macAddressValidationSchema
      .required(requiredMsg)
      .concat(getUniqueValidationSchema(getAllMacAddresses)),
    ips: Yup.object().shape<HostIps>({
      ipv4: showIpv4(networkWideValues.protocolType)
        ? getInMachineNetworkValidationSchema(
            'ipv4',
            networkWideValues.ipConfigs['ipv4'].machineNetwork,
          )
            .required(requiredMsg)
            .concat(getUniqueValidationSchema(getAllIpv4Addresses))
        : Yup.string(),
      ipv6: showIpv6(networkWideValues.protocolType)
        ? getInMachineNetworkValidationSchema(
            'ipv6',
            networkWideValues.ipConfigs['ipv6'].machineNetwork,
          )
            .required(requiredMsg)
            .concat(getUniqueValidationSchema(getAllIpv6Addresses))
        : Yup.string(),
    }),
  });

export const getFormViewHostsValidationSchema = (networkWideValues: FormViewNetworkWideValues) => {
  return Yup.object().shape({
    hosts: Yup.array<FormViewHost>().of(getHostValidationSchema(networkWideValues)),
  });
};
