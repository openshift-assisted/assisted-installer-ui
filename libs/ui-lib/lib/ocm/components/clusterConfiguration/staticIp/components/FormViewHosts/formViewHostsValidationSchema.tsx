import * as Yup from 'yup';

import { FormViewNetworkWideValues, FormViewHostsValues } from '../../data/dataTypes';
import {
  getInMachineNetworkValidationSchema,
  getIpIsNotNetworkOrBroadcastAddressSchema,
  macAddressValidationSchema,
  ProtocolVersion,
} from '../../../../../../common';
import { showIpv4, showIpv6 } from '../../../../../../common/components/staticIP/protocolVersion';
import {
  getUniqueValidationSchema,
  UniqueStringArrayExtractor,
} from '../../commonValidationSchemas';
import { getMachineNetworkCidr } from '../../../../../../common/components/staticIP/machineNetwork';
import { TFunction } from 'i18next';
const requiredMsg = 'A value is required';

const getAllIpv4Addresses: UniqueStringArrayExtractor<FormViewHostsValues> = (
  values: FormViewHostsValues,
) => values.hosts.map((host) => host.ips.ipv4);

const getAllIpv6Addresses: UniqueStringArrayExtractor<FormViewHostsValues> = (
  values: FormViewHostsValues,
) => values.hosts.map((host) => host.ips.ipv6);

const getAllMacAddresses: UniqueStringArrayExtractor<FormViewHostsValues> = (
  values: FormViewHostsValues,
) => {
  return values.hosts.map((host) => host.macAddress);
};

const getAllBondInterfaces: UniqueStringArrayExtractor<FormViewHostsValues> = (
  values: FormViewHostsValues,
) => {
  return values.hosts.flatMap((host) => [
    host.bondPrimaryInterface.toLowerCase(),
    host.bondSecondaryInterface.toLowerCase(),
  ]);
};

const getHostValidationSchema = (networkWideValues: FormViewNetworkWideValues, t: TFunction) =>
  Yup.object({
    macAddress: Yup.mixed().when('useBond', {
      is: false,
      then: () =>
        macAddressValidationSchema(t)
          .required(requiredMsg)
          .concat(getUniqueValidationSchema(getAllMacAddresses)),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    ips: Yup.object({
      ipv4: showIpv4(networkWideValues.protocolType)
        ? getInMachineNetworkValidationSchema(
            ProtocolVersion.ipv4,
            networkWideValues.ipConfigs['ipv4'].machineNetwork,
            t,
          )
            .required(requiredMsg)
            .concat(getUniqueValidationSchema(getAllIpv4Addresses))
            .concat(
              getIpIsNotNetworkOrBroadcastAddressSchema(
                ProtocolVersion.ipv4,
                getMachineNetworkCidr(networkWideValues.ipConfigs['ipv4'].machineNetwork),
                t,
              ),
            )
        : Yup.string(),
      ipv6: showIpv6(networkWideValues.protocolType)
        ? getInMachineNetworkValidationSchema(
            ProtocolVersion.ipv6,
            networkWideValues.ipConfigs['ipv6'].machineNetwork,
            t,
          )
            .required(requiredMsg)
            .concat(getUniqueValidationSchema(getAllIpv6Addresses))
            .concat(
              getIpIsNotNetworkOrBroadcastAddressSchema(
                ProtocolVersion.ipv6,
                getMachineNetworkCidr(networkWideValues.ipConfigs['ipv6'].machineNetwork),
                t,
              ),
            )
        : Yup.string(),
    }),
    bondPrimaryInterface: Yup.mixed().when('useBond', {
      is: true,
      then: () =>
        macAddressValidationSchema(t)
          .required(requiredMsg)
          .concat(getUniqueValidationSchema(getAllBondInterfaces)),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    bondSecondaryInterface: Yup.mixed().when('useBond', {
      is: true,
      then: () =>
        macAddressValidationSchema(t)
          .required(requiredMsg)
          .concat(getUniqueValidationSchema(getAllBondInterfaces)),
      otherwise: () => Yup.mixed().notRequired(),
    }),
  });

export const getFormViewHostsValidationSchema = (
  networkWideValues: FormViewNetworkWideValues,
  t: TFunction,
) => {
  return Yup.object().shape({
    hosts: Yup.array(getHostValidationSchema(networkWideValues, t)),
  });
};
