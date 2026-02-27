import * as Yup from 'yup';
import { Address4, Address6 } from 'ip-address';
import isCIDR from 'is-cidr';
import { isInSubnet } from 'is-in-subnet';

import { getAddress } from '../components/ui/formik/utils';
import { getSubnet } from '../components/clusterConfiguration/utils';
import { HostSubnets, NetworkConfigurationValues } from '../types';
import { IP_V4_ZERO, IP_V6_ZERO, MAC_REGEX } from './regexes';
import { getArrayIndexFromPath, isIPorDN, isIPv4Address, isIPv6Address } from './utils';
import { NO_SUBNET_SET } from '../config';
import { overlap } from 'cidr-tools';
import parseUrl from 'parse-url';
import { TFunction } from 'i18next';

export const ipValidationSchema = (t: TFunction) =>
  Yup.string().test(
    'ip-validation',
    t('ai:Not a valid IP address'),
    (value?: string) => Address4.isValid(value || '') || Address6.isValid(value || ''),
  );

export const ipNoSuffixValidationSchema = (t: TFunction) =>
  Yup.string().test('ip-validation-no-suffix', t('ai:Not a valid IP address'), (value?: string) => {
    if (!value) return true;
    const address = getAddress(value || '');
    return !!address && address.address === address.addressMinusSuffix;
  });

export const macAddressValidationSchema = (t: TFunction) =>
  Yup.string().matches(MAC_REGEX, {
    message: (value) => t('ai:Value "{{value}}" is not valid MAC address.', { value }),
    excludeEmptyString: true,
  });

export const vipRangeValidationSchema = (
  hostSubnets: HostSubnets,
  { machineNetworks }: NetworkConfigurationValues,
  allowSuffix: boolean,
  t: TFunction,
) =>
  Yup.string().test('vip-validation', t('ai:IP Address is outside of selected subnet'), (value) => {
    if (!value) {
      return true;
    }

    try {
      const validator = allowSuffix ? ipValidationSchema : ipNoSuffixValidationSchema;
      validator(t).validateSync(value);
    } catch (err) {
      return true;
    }
    // Find host subnets that match the selected machine networks
    const cidrs = machineNetworks?.map((network) => network.cidr) ?? [];
    const matchingSubnets = hostSubnets.filter((hostSubnet) => cidrs.includes(hostSubnet.subnet));

    for (const hostSubnet of matchingSubnets) {
      if (hostSubnet?.subnet) {
        // Workaround for bug in CIM backend. hostIDs are empty
        if (!hostSubnet.hostIDs.length) {
          return true;
        } else if (isInSubnet(value, hostSubnet.subnet)) {
          return true;
        }
      }
    }
    return false;
  });

const vipBroadcastValidationSchema = (
  { machineNetworks }: NetworkConfigurationValues,
  t: TFunction,
) =>
  Yup.string().test(
    'vip-no-broadcast',
    t('ai:The IP address cannot be a network or broadcast address'),
    function (value?: string) {
      if (!value) {
        return true;
      }

      const vipAddress = getAddress(value)?.address;
      if (!vipAddress) {
        return true;
      }

      const index = getArrayIndexFromPath(this.path || '');
      const machineNetworkCidr = machineNetworks?.[index]?.cidr ?? machineNetworks?.[0]?.cidr ?? '';
      if (!machineNetworkCidr) {
        return true;
      }

      const machineNetwork = getAddress(machineNetworkCidr);
      if (!machineNetwork) {
        return true;
      }

      const machineNetworkBroadcast = machineNetwork.endAddress().address;
      const machineNetworkAddress = machineNetwork.startAddress().address;

      return vipAddress !== machineNetworkBroadcast && vipAddress !== machineNetworkAddress;
    },
  );

export const hostSubnetValidationSchema = Yup.string().when(['managedNetworkingType'], {
  is: (managedNetworkingType: NetworkConfigurationValues['managedNetworkingType']) =>
    managedNetworkingType === 'clusterManaged',
  then: () => Yup.string().notOneOf([NO_SUBNET_SET], 'Host subnet must be selected.'),
});

export const vipNoSuffixValidationSchema = (
  hostSubnets: HostSubnets,
  values: NetworkConfigurationValues,
  t: TFunction,
) =>
  Yup.mixed().when(['vipDhcpAllocation', 'managedNetworkingType'], {
    is: (
      vipDhcpAllocation: NetworkConfigurationValues['vipDhcpAllocation'],
      managedNetworkingType: NetworkConfigurationValues['managedNetworkingType'],
    ) => !vipDhcpAllocation && managedNetworkingType !== 'userManaged',
    then: () => {
      // Per-item schema for VIPs (apiVips[*].ip / ingressVips[*].ip)
      // 1) Require value once set
      // 2) Validate IP without suffix
      // 3) Ensure VIP family matches machineNetworks[idx] family
      // 4) Validate range vs selected subnets
      // 5) No broadcast/network address
      // 6) Uniqueness across API/Ingress
      const vipFamilyMatchSchema = Yup.string().test(
        'vip-family-match-machine-network',
        t('ai:IP family must match the corresponding machine network family.'),
        function (value?: string) {
          if (!value) {
            return true;
          }
          const index = getArrayIndexFromPath(this.path || '');
          if (Number.isNaN(index)) {
            return true;
          }
          const cidr = values.machineNetworks?.[index]?.cidr || '';
          const mnIsV4 = isCIDR.v4(cidr);
          const mnIsV6 = isCIDR.v6(cidr);
          // If machine network at index is not selected/valid, don't block validation here
          if (!mnIsV4 && !mnIsV6) {
            return true;
          }
          const ipIsV4 = isIPv4Address(value);
          const ipIsV6 = isIPv6Address(value);
          if (!ipIsV4 && !ipIsV6) {
            return true;
          }
          return mnIsV4 ? ipIsV4 : ipIsV6;
        },
      );
      // Ensure API and Ingress VIPs at the same index are not the same
      const vipUniqueSchema = Yup.string().test('vip-uniqueness', function (value?: string) {
        if (!value) {
          return true;
        }
        const index = getArrayIndexFromPath(this.path || '');
        if (Number.isNaN(index)) {
          return true;
        }
        const apiVip = values.apiVips?.[index]?.ip;
        const ingressVip = values.ingressVips?.[index]?.ip;
        if (!apiVip || !ingressVip) {
          return true;
        }
        if (apiVip === ingressVip) {
          return this.createError({
            message: t('ai:The {{label}} Ingress and API IP addresses cannot be the same.', {
              label: index === 0 ? t('ai:primary') : t('ai:secondary'),
            }),
          });
        }
        return true;
      });
      const requiredField = (message: string) =>
        Yup.string().test('required-field', message, function (value?: string) {
          const index = getArrayIndexFromPath(this.path || '');
          const api1 = (values.apiVips?.[1]?.ip ?? '').toString().trim();
          const ingress1 = (values.ingressVips?.[1]?.ip ?? '').toString().trim();
          // Dual-stack: secondary VIPs (index 1) are optional; skip required when both are empty
          if (index === 1 && api1 === '' && ingress1 === '') return true;
          return !!value;
        });

      return requiredField(t('ai:Required field'))
        .concat(ipNoSuffixValidationSchema(t))
        .concat(vipFamilyMatchSchema)
        .concat(vipRangeValidationSchema(hostSubnets, values, false, t))
        .concat(vipBroadcastValidationSchema(values, t))
        .concat(vipUniqueSchema);
    },
  });

export const vipArrayValidationSchema = <T extends Yup.Maybe<Yup.AnyObject>>(
  hostSubnets: HostSubnets,
  values: NetworkConfigurationValues,
  t: TFunction,
) =>
  values.managedNetworkingType === 'clusterManaged'
    ? Yup.array<T>().of(
        Yup.object({
          clusterId: Yup.string(),
          ip: vipNoSuffixValidationSchema(hostSubnets, values, t),
        }),
      )
    : Yup.array<T>();

export const ipBlockValidationSchema = (
  reservedCidrs: string | string[] | undefined,
  t: TFunction,
) =>
  Yup.string()
    .required('A value is required.')
    .test(
      'valid-ip-address',
      t(
        'ai:Invalid IP address block. Expected value is a network expressed in CIDR notation (IP/netmask). For example: 123.123.123.0/24, 2055:d7a::/116',
      ),
      (value?: string): boolean => !!value && (isCIDR.v4(value) || isCIDR.v6(value)),
    )
    .test(
      'valid-netmask',
      t(
        'ai:IPv4 netmask must be between 1-25 and include at least 128 addresses.\nIPv6 netmask must be between 8-128 and include at least 256 addresses.',
      ),
      (value?: string) => {
        const suffix = parseInt((value || '').split('/')[1]);

        return (
          (isCIDR.v4(value || '') && 0 < suffix && suffix < 26) ||
          (isCIDR.v6(value || '') && 7 < suffix && suffix < 129)
        );
      },
    )
    .test(
      'cidr-is-not-unspecified',
      t(
        'ai:The specified CIDR is invalid because its resulting routing prefix matches the unspecified address.',
      ),
      (cidr: string) => {
        const ip = getSubnet(cidr);
        if (ip === null) {
          return false;
        }

        // The first address is used to represent the network
        const startAddress = ip.startAddress().address;

        return startAddress !== IP_V4_ZERO && startAddress !== IP_V6_ZERO;
      },
    )
    .test(
      'valid-cidr-base-address',
      ({ value }) => t('ai:{{value}} is not a valid CIDR', { value: value as string }),
      (cidr: string) => {
        const ip = getSubnet(cidr);
        if (ip === null) {
          return false;
        }

        const networkAddress = ip.startAddress().parsedAddress;
        const ipAddress = ip.parsedAddress;
        const result = ipAddress.every((part, idx) => part === networkAddress[idx]);

        return result;
      },
    )
    .test('cidrs-can-not-overlap', t('ai:Provided CIDRs can not overlap.'), (cidr: string) => {
      try {
        if (cidr && reservedCidrs && reservedCidrs.length > 0) {
          return !overlap(cidr, reservedCidrs);
        }
      } catch {
        return false;
      }
      // passing by default
      return true;
    });

export const hostPrefixValidationSchema = (
  clusterNetworkCidr: NetworkConfigurationValues['clusterNetworkCidr'],
  t: TFunction,
) => {
  const requiredText = t('ai:Required field');
  const minMaxText = t(
    'ai:The host prefix is a number between 1 and 32 for IPv4 and between 8 and 128 for IPv6.',
  );
  const netBlock = (clusterNetworkCidr || '').split('/')[1];
  if (!netBlock) {
    return Yup.number().required(requiredText).min(1, minMaxText).max(32, minMaxText);
  }

  let netBlockNumber = parseInt(netBlock);
  if (isNaN(netBlockNumber)) {
    netBlockNumber = 1;
  }

  const errorMsgPrefix = t(
    'ai:The host prefix is a number between size of the cluster network CIDR range',
  );
  const errorMsgIPv4 = t('ai:{{errorMsgPrefix}} ({{netBlockNumber}}) and 25.', {
    errorMsgPrefix,
    netBlockNumber,
  });
  const errorMsgIPv6 = t('ai:{{errorMsgPrefix}} (8) and 128.', { errorMsgPrefix });

  if (isCIDR.v6(clusterNetworkCidr || '')) {
    return Yup.number().required(requiredText).min(8, errorMsgIPv6).max(128, errorMsgIPv6);
  }

  if (isCIDR.v4(clusterNetworkCidr || '')) {
    return Yup.number()
      .required(requiredText)
      .min(netBlockNumber, errorMsgIPv4)
      .max(25, errorMsgIPv4);
  }

  return Yup.number().required(requiredText);
};

export const day2ApiVipValidationSchema = (t: TFunction) =>
  Yup.string().test(
    'day2-api-vip',
    t('ai:Provide a valid DNS name or IP Address'),
    (value?: string) => {
      if (!value) {
        return true;
      }
      return isIPorDN(value);
    },
  );

export const bmcAddressValidationSchema = (t: TFunction) => {
  return Yup.string()
    .required()
    .test(
      'valid-bmc-address',
      t(
        'ai:The Value is not valid BMC address, supported protocols are redfish-virtualmedia or idrac-virtualmedia.',
      ),
      (val) => {
        try {
          const url = parseUrl(val);
          return ['redfish-virtualmedia', 'idrac-virtualmedia'].includes(url.protocol as string);
        } catch (error) {
          return false;
        }
      },
    );
};
