import * as Yup from 'yup';

import { FormViewHost, HostIps, FormViewNetworkWideValues } from '../../data/dataTypes';
import { macAddressValidationSchema } from '../../../../../../common';
import { showIpv4, showIpv6 } from '../../data/protocolVersion';
import { getInMachineNetworkValidationSchema } from '../FormViewNetworkWide/formViewNetworkWideValidationSchema';
const requiredMsg = 'A value is required';

const getHostValidationSchema = (networkWideValues: FormViewNetworkWideValues) =>
  Yup.object().shape<FormViewHost>({
    macAddress: macAddressValidationSchema.required(requiredMsg),
    ips: Yup.object().shape<HostIps>({
      ipv4: showIpv4(networkWideValues.protocolType)
        ? getInMachineNetworkValidationSchema(
            'ipv4',
            networkWideValues.ipConfigs['ipv4'].machineNetwork,
          ).required(requiredMsg)
        : Yup.string(),
      ipv6: showIpv6(networkWideValues.protocolType)
        ? getInMachineNetworkValidationSchema(
            'ipv6',
            networkWideValues.ipConfigs['ipv6'].machineNetwork,
          ).required(requiredMsg)
        : Yup.string(),
    }),
  });

export const getFormViewHostsValidationSchema = (networkWideValues: FormViewNetworkWideValues) => {
  return Yup.object().shape({
    hosts: Yup.array<FormViewHost>().of(getHostValidationSchema(networkWideValues)),
  });
};
