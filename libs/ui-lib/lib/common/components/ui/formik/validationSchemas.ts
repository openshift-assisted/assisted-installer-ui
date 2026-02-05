import { overlap } from 'cidr-tools';
import { Address4, Address6 } from 'ip-address';
import isCIDR from 'is-cidr';
import { isInSubnet } from 'is-in-subnet';
import * as Yup from 'yup';
import parseUrl from 'parse-url';

import { TFunction } from 'i18next';
import {
  ClusterNetwork,
  MachineNetwork,
  ServiceNetwork,
} from '@openshift-assisted/types/assisted-installer-service';
import { NO_SUBNET_SET } from '../../../config/constants';
import { ProxyFieldsType } from '../../../types';
import { HostSubnets, NetworkConfigurationValues } from '../../../types/clusters';
import { getSubnet } from '../../clusterConfiguration/utils';
import {
  bmcAddressValidationMessages,
  clusterNameValidationMessages,
  CLUSTER_NAME_MAX_LENGTH,
  FORBIDDEN_HOSTNAMES,
  hostnameValidationMessages,
  locationValidationMessages,
  nameValidationMessages,
} from './constants';
import { allSubnetsIPv4, getAddress, trimCommaSeparatedList, trimSshPublicKey } from './utils';
import { isMajorMinorVersionEqualOrGreater } from '../../../utils';
import { ClusterDetailsValues } from '../../clusterWizard/types';

const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;
const NAME_START_END_REGEX = /^[a-z0-9](.*[a-z0-9])?$/;
const NAME_CHARS_REGEX = /^[a-z0-9-.]*$/;
const CLUSTER_NAME_START_END_REGEX = /^[a-z0-9](.*[a-z0-9])?$/;
const CLUSTER_NAME_VALID_CHARS_REGEX = /^[a-z0-9-]*$/;
const SSH_PUBLIC_KEY_REGEX =
  /^(ssh-rsa AAAAB3NzaC1yc2|ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNT|ecdsa-sha2-nistp384 AAAAE2VjZHNhLXNoYTItbmlzdHAzODQAAAAIbmlzdHAzOD|ecdsa-sha2-nistp521 AAAAE2VjZHNhLXNoYTItbmlzdHA1MjEAAAAIbmlzdHA1Mj|ssh-ed25519 AAAAC3NzaC1lZDI1NTE5|ssh-dss AAAAB3NzaC1kc3)[0-9A-Za-z+/]+[=]{0,3}( .*)?$/;
// DNS is case-insensitive per RFC 4343
const DNS_NAME_REGEX = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;

const PROXY_DNS_REGEX =
  /(^\.?([a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62}){1}(\.[a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62})*$)/;
const IP_V4_ZERO = '0.0.0.0';
const IP_V6_ZERO = '0000:0000:0000:0000:0000:0000:0000:0000';
const MAC_REGEX = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/;
const HOST_NAME_REGEX = /^[^.]{1,63}(?:[.][^.]{1,63})*$/;
const LOCATION_CHARS_REGEX = /^[a-zA-Z0-9-._]*$/;

export const nameValidationSchema = (
  t: TFunction,
  usedClusterNames: string[],
  baseDnsDomain = '',
  validateUniqueName?: boolean,
  isOcm = false,
) => {
  const clusterNameValidationMessagesList = clusterNameValidationMessages(t);
  return Yup.string()
    .required(t('ai:Required field'))
    .matches(CLUSTER_NAME_VALID_CHARS_REGEX, {
      message: clusterNameValidationMessagesList.INVALID_VALUE,
      excludeEmptyString: true,
    })
    .matches(CLUSTER_NAME_START_END_REGEX, {
      message: clusterNameValidationMessagesList.INVALID_START_END,
      excludeEmptyString: true,
    })
    .min(
      isOcm ? 1 : 2,
      isOcm
        ? clusterNameValidationMessagesList.INVALID_LENGTH_OCM
        : clusterNameValidationMessagesList.INVALID_LENGTH_ACM,
    )
    .max(
      CLUSTER_NAME_MAX_LENGTH,
      isOcm
        ? clusterNameValidationMessagesList.INVALID_LENGTH_OCM
        : clusterNameValidationMessagesList.INVALID_LENGTH_ACM,
    )
    .when('useRedHatDnsService', {
      is: (useRedHatDnsService: ClusterDetailsValues['useRedHatDnsService']) =>
        useRedHatDnsService === true,
      then: (schema) =>
        schema.test(
          'is-name-unique',
          clusterNameValidationMessagesList.NOT_UNIQUE,
          (value?: string) => {
            const clusterFullName = `${value || ''}.${baseDnsDomain}`;
            return !value || !usedClusterNames.includes(clusterFullName);
          },
        ),
      otherwise: (schema) =>
        schema.test(
          'is-name-unique',
          clusterNameValidationMessagesList.NOT_UNIQUE,
          (value?: string) => {
            // in CIM cluster name is ClusterDeployment CR name which must be unique
            return validateUniqueName ? !value || !usedClusterNames.includes(value) : true;
          },
        ),
    });
};

export const sshPublicKeyValidationSchema = Yup.string().test(
  'ssh-public-key',
  'SSH public key must consist of "[TYPE] key [[EMAIL]]", supported types are: ssh-rsa, ssh-ed25519, ecdsa-[VARIANT]. A single key can be provided only.',
  (value?: string) => {
    if (!value) {
      return true;
    }

    return !!trimSshPublicKey(value).match(SSH_PUBLIC_KEY_REGEX);
  },
);

export const sshPublicKeyListValidationSchema = Yup.string()
  .test(
    'ssh-public-keys',
    'SSH public key must consist of "[TYPE] key [[EMAIL]]", supported types are: ssh-rsa, ssh-ed25519, ecdsa-[VARIANT].',
    (value?: string) => {
      if (!value) {
        return true;
      }

      return (
        trimSshPublicKey(value)
          .split('\n')
          .find((line: string) => !line.match(SSH_PUBLIC_KEY_REGEX)) === undefined
      );
    },
  )
  .test('ssh-public-keys-unique', 'SSH public keys must be unique.', (value?: string) => {
    if (!value) {
      return true;
    }
    const keyList = trimSshPublicKey(value).split('\n');
    return new Set(keyList).size === keyList.length;
  });

export const pullSecretValidationSchema = Yup.string().test(
  'is-well-formed-json',
  "Invalid pull secret format. You must use your Red Hat account's pull secret.",
  (value?: string) => {
    const isValid = true;
    if (!value) return isValid;
    try {
      const pullSecret = JSON.parse(value) as {
        auths: string;
      };
      return (
        pullSecret.constructor.name === 'Object' &&
        !!pullSecret?.auths &&
        pullSecret.auths.constructor.name === 'Object'
      );
    } catch {
      return !isValid;
    }
  },
);

const isValidIpWithoutSuffix = (addr: string) => {
  const address = getAddress(addr);
  return !!address && address.address === address.addressMinusSuffix;
};

export const ipValidationSchema = Yup.string().test(
  'ip-validation',
  'Not a valid IP address',
  (value?: string) => Address4.isValid(value || '') || Address6.isValid(value || ''),
);

// Helpers to classify literal IPs more robustly
const isIPv4Address = (ip?: string) => {
  if (!ip) return false;
  return ip.includes('.') && Address4.isValid(ip);
};

const isIPv6Address = (ip?: string) => {
  if (!ip) return false;
  return ip.includes(':') && Address6.isValid(ip);
};

export const ipNoSuffixValidationSchema = Yup.string().test(
  'ip-validation-no-suffix',
  'Not a valid IP address',
  (value?: string) => {
    return isValidIpWithoutSuffix(value || '');
  },
);

export const macAddressValidationSchema = Yup.string().matches(MAC_REGEX, {
  message: 'Value "${value}" is not valid MAC address.', // eslint-disable-line no-template-curly-in-string
  excludeEmptyString: true,
});

export const vipRangeValidationSchema = (
  hostSubnets: HostSubnets,
  { machineNetworks }: NetworkConfigurationValues,
  allowSuffix: boolean,
) =>
  Yup.string().test('vip-validation', 'IP Address is outside of selected subnet', (value) => {
    if (!value) {
      return true;
    }

    try {
      const validator = allowSuffix ? ipValidationSchema : ipNoSuffixValidationSchema;
      validator.validateSync(value);
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

const vipBroadcastValidationSchema = ({ machineNetworks }: NetworkConfigurationValues) =>
  Yup.string().test(
    'vip-no-broadcast',
    'The IP address cannot be a network or broadcast address',
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

const alwaysRequired = (message?: string) =>
  Yup.string().test(
    'always-required',
    message || 'The value is required.',
    (value?: string): boolean => !!value,
  );

const getArrayIndexFromPath = (path: string): number => {
  const match = path.match(/\[(\d+)\][^\[]*$/); // Prefer the last [...] occurrence for nested array paths like "foo[0].bar[1].ip"
  return match ? parseInt(match[1], 10) : NaN;
};

export const hostSubnetValidationSchema = Yup.string().when(['managedNetworkingType'], {
  is: (managedNetworkingType: NetworkConfigurationValues['managedNetworkingType']) =>
    managedNetworkingType === 'clusterManaged',
  then: () => Yup.string().notOneOf([NO_SUBNET_SET], 'Host subnet must be selected.'),
});

export const vipNoSuffixValidationSchema = (
  hostSubnets: HostSubnets,
  values: NetworkConfigurationValues,
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
        'IP family must match the corresponding machine network family.',
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
          const label = index === 0 ? 'primary' : 'secondary';
          return this.createError({
            message: `The ${label} Ingress and API IP addresses cannot be the same.`,
          });
        }
        return true;
      });

      return alwaysRequired('Required. Please provide an IP address')
        .concat(ipNoSuffixValidationSchema)
        .concat(vipFamilyMatchSchema)
        .concat(vipRangeValidationSchema(hostSubnets, values, false))
        .concat(vipBroadcastValidationSchema(values))
        .concat(vipUniqueSchema);
    },
  });

export const vipArrayValidationSchema = <T extends Yup.Maybe<Yup.AnyObject>>(
  hostSubnets: HostSubnets,
  values: NetworkConfigurationValues,
) =>
  values.managedNetworkingType === 'clusterManaged'
    ? Yup.array<T>().of(
        Yup.object({
          clusterId: Yup.string(),
          ip: vipNoSuffixValidationSchema(hostSubnets, values),
        }),
      )
    : Yup.array<T>();

export const ipBlockValidationSchema = (reservedCidrs: string | string[] | undefined) =>
  Yup.string()
    .required('A value is required.')
    .test(
      'valid-ip-address',
      'Invalid IP address block. Expected value is a network expressed in CIDR notation (IP/netmask). For example: 123.123.123.0/24, 2055:d7a::/116',
      (value?: string): boolean => !!value && (isCIDR.v4(value) || isCIDR.v6(value)),
    )
    .test(
      'valid-netmask',
      'IPv4 netmask must be between 1-25 and include at least 128 addresses.\nIPv6 netmask must be between 8-128 and include at least 256 addresses.',
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
      'The specified CIDR is invalid because its resulting routing prefix matches the unspecified address.',
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
      ({ value }) => `${value as string} is not a valid CIDR`,
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
    .test('cidrs-can-not-overlap', 'Provided CIDRs can not overlap.', (cidr: string) => {
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

export const dnsNameValidationSchema = Yup.string()
  .test(
    'dns-name-label-length',
    'Single label of the DNS name can not be longer than 63 characters.',
    (value?: string) => (value || '').split('.').every((label: string) => label.length <= 63),
  )
  .matches(DNS_NAME_REGEX, {
    message: 'Value "${value}" is not valid DNS name. Example: basedomain.example.com', // eslint-disable-line no-template-curly-in-string
    excludeEmptyString: true,
  });

export const baseDomainValidationSchema = Yup.string()
  .test(
    'dns-name-label-length',
    'Every single host component in the base domain name cannot contain more than 63 characters and must not contain spaces.',
    (value?: string) => {
      // Check if the value contains any spaces
      if (/\s/.test(value as string)) {
        return false; // Value contains spaces, validation fails
      }

      // Check the label lengths
      const labels = (value || '').split('.');
      return labels.every((label: string) => label.length <= 63);
    },
  )
  .matches(DNS_NAME_REGEX, {
    message: 'Value "${value}" is not valid DNS name. Example: basedomain.redhat.com', // eslint-disable-line no-template-curly-in-string
    excludeEmptyString: true,
  });

export const hostPrefixValidationSchema = (
  clusterNetworkCidr: NetworkConfigurationValues['clusterNetworkCidr'],
) => {
  const requiredText = 'The host prefix is required.';
  const minMaxText =
    'The host prefix is a number between 1 and 32 for IPv4 and between 8 and 128 for IPv6.';
  const netBlock = (clusterNetworkCidr || '').split('/')[1];
  if (!netBlock) {
    return Yup.number().required(requiredText).min(1, minMaxText).max(32, minMaxText);
  }

  let netBlockNumber = parseInt(netBlock);
  if (isNaN(netBlockNumber)) {
    netBlockNumber = 1;
  }

  const errorMsgPrefix =
    'The host prefix is a number between size of the cluster network CIDR range';
  const errorMsgIPv4 = `${errorMsgPrefix} (${netBlockNumber}) and 25.`;
  const errorMsgIPv6 = `${errorMsgPrefix} (8) and 128.`;

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

export const richNameValidationSchema = (t: TFunction, usedNames: string[], origName?: string) => {
  const nameValidationMessagesList = nameValidationMessages(t);
  return Yup.string()
    .min(1, nameValidationMessagesList.INVALID_LENGTH)
    .max(253, nameValidationMessagesList.INVALID_LENGTH)
    .test(
      nameValidationMessagesList.INVALID_START_END,
      nameValidationMessagesList.INVALID_START_END,
      (value?: string) => {
        const trimmed = value?.trim();
        if (!trimmed) {
          return true;
        }
        return (
          !!trimmed[0].match(NAME_START_END_REGEX) &&
          (trimmed[trimmed.length - 1]
            ? !!trimmed[trimmed.length - 1].match(NAME_START_END_REGEX)
            : true)
        );
      },
    )
    .matches(HOST_NAME_REGEX, nameValidationMessagesList.INVALID_FORMAT)
    .matches(NAME_CHARS_REGEX, {
      message: nameValidationMessagesList.INVALID_VALUE,
      excludeEmptyString: true,
    })
    .test(nameValidationMessagesList.NOT_UNIQUE, nameValidationMessagesList.NOT_UNIQUE, (value) => {
      if (!value || value === origName) {
        return true;
      }
      return !usedNames.find((n) => n === value);
    })
    .notOneOf(FORBIDDEN_HOSTNAMES, hostnameValidationMessages(t).LOCALHOST_ERR);
};

export const richHostnameValidationSchema = (
  t: TFunction,
  usedNames: string[],
  origName?: string,
) => {
  const hostnameValidationMessagesList = hostnameValidationMessages(t);
  return Yup.string()
    .min(1, hostnameValidationMessagesList.INVALID_LENGTH)
    .max(63, hostnameValidationMessagesList.INVALID_LENGTH)
    .test(
      hostnameValidationMessagesList.INVALID_START_END,
      hostnameValidationMessagesList.INVALID_START_END,
      (value?: string) => {
        const trimmed = value?.trim();
        if (!trimmed) {
          return true;
        }
        return (
          !!trimmed[0].match(NAME_START_END_REGEX) &&
          (trimmed[trimmed.length - 1]
            ? !!trimmed[trimmed.length - 1].match(NAME_START_END_REGEX)
            : true)
        );
      },
    )
    .matches(NAME_CHARS_REGEX, {
      message: hostnameValidationMessagesList.INVALID_VALUE,
      excludeEmptyString: true,
    })
    .test(
      hostnameValidationMessagesList.NOT_UNIQUE,
      hostnameValidationMessagesList.NOT_UNIQUE,
      (value) => {
        if (!value || value === origName) {
          return true;
        }
        return !usedNames.find((n) => n === value);
      },
    )
    .notOneOf(FORBIDDEN_HOSTNAMES, hostnameValidationMessagesList.LOCALHOST_ERR);
};

const httpProxyValidationMessage = 'Provide a valid HTTP URL.';
export const httpProxyValidationSchema = ({
  values,
  pairValueName,
  allowEmpty,
}: {
  values: ProxyFieldsType;
  pairValueName: 'httpProxy' | 'httpsProxy';
  allowEmpty?: boolean;
}) => {
  const validation = Yup.string().test(
    'http-proxy-validation',
    httpProxyValidationMessage,
    (value?: string) => {
      if (!value) {
        return true;
      }

      if (!value.startsWith('http://')) {
        return false;
      }

      try {
        new URL(value);
      } catch {
        return false;
      }
      return true;
    },
  );

  if (allowEmpty) {
    return validation;
  }

  return validation.test(
    'http-proxy-no-empty-validation',
    'At least one of the HTTP or HTTPS proxy URLs is required.',
    (value) => !values.enableProxy || !!value || !!values[pairValueName],
  );
};

const isIPorDN = (value?: string, dnsRegex = DNS_NAME_REGEX) => {
  if ((value as string).match(dnsRegex)) {
    return true;
  }
  try {
    ipValidationSchema.validateSync(value);
    return true;
  } catch (err) {
    return false;
  }
};

export const noProxyValidationSchema = Yup.string().test(
  'no-proxy-validation',
  'Provide a comma separated list of valid DNS names or IP addresses.',
  (value?: string) => {
    if (!value || value === '*') {
      return true;
    }

    // https://docs.openshift.com/container-platform/4.5/installing/installing_bare_metal/installing-restricted-networks-bare-metal.html#installation-configure-proxy_installing-restricted-networks-bare-metal
    // A comma-separated list of destination domain names, domains, IP addresses, or other network CIDRs to exclude proxying.
    // Preface a domain with . to match subdomains only. For example, .y.com matches x.y.com, but not y.com.
    // Use * to bypass proxy for all destinations.
    const noProxyList = trimCommaSeparatedList(value).split(',');
    return noProxyList.every((p) => isIPorDN(p, PROXY_DNS_REGEX));
  },
);

export const ntpSourceValidationSchema = Yup.string()
  .test(
    'ntp-source-validation',
    'Provide a comma separated list of valid DNS names or IP addresses.',
    (value?: string) => {
      if (!value || value === '') {
        return true;
      }
      return trimCommaSeparatedList(value)
        .split(',')
        .every((v) => isIPorDN(v));
    },
  )
  .test(
    'ntp-source-validation-unique',
    'DNS names and IP addresses must be unique.',
    (value?: string) => {
      if (!value || value === '') {
        return true;
      }
      const arr = trimCommaSeparatedList(value).split(',');
      return arr.length === new Set(arr).size;
    },
  );

export const day2ApiVipValidationSchema = Yup.string().test(
  'day2-api-vip',
  'Provide a valid DNS name or IP Address',
  (value?: string) => {
    if (!value) {
      return true;
    }
    return isIPorDN(value);
  },
);

export const bmcAddressValidationSchema = (t: TFunction) => {
  const bmcAddressValidationMessagesList = bmcAddressValidationMessages(t);

  return Yup.string()
    .required()
    .test('valid-bmc-address', bmcAddressValidationMessagesList.INVALID_VALUE, (val) => {
      try {
        const url = parseUrl(val);
        return ['redfish-virtualmedia', 'idrac-virtualmedia'].includes(url.protocol as string);
      } catch (error) {
        return false;
      }
    });
};
export const locationValidationSchema = (t: TFunction) => {
  const locationValidationMessagesList = locationValidationMessages(t);
  return Yup.string()
    .min(1, locationValidationMessagesList.INVALID_LENGTH)
    .max(63, locationValidationMessagesList.INVALID_LENGTH)
    .test(
      locationValidationMessagesList.INVALID_START_END,
      locationValidationMessagesList.INVALID_START_END,
      (value?: string) => {
        const trimmed = value?.trim();
        if (!trimmed) {
          return true;
        }
        return (
          !!trimmed[0].match(ALPHANUMERIC_REGEX) &&
          (trimmed[trimmed.length - 1]
            ? !!trimmed[trimmed.length - 1].match(ALPHANUMERIC_REGEX)
            : true)
        );
      },
    )
    .matches(LOCATION_CHARS_REGEX, {
      message: locationValidationMessagesList.INVALID_VALUE,
      excludeEmptyString: true,
    });
};

export const machineNetworksValidationSchema = Yup.array().of(
  Yup.object({ cidr: hostSubnetValidationSchema, clusterId: Yup.string() }),
);

export const clusterNetworksValidationSchema = Yup.array().of(
  Yup.lazy((values: ClusterNetwork) =>
    Yup.object({
      cidr: ipBlockValidationSchema(
        undefined /* So far used in OCM only and so validated by backend */,
      ),
      hostPrefix: hostPrefixValidationSchema(values.cidr),
      clusterId: Yup.string(),
    }),
  ),
);

export const serviceNetworkValidationSchema = Yup.array().of(
  Yup.object({
    cidr: ipBlockValidationSchema(
      undefined /* So far used in OCM only and so validated by backend */,
    ),
    clusterId: Yup.string(),
  }),
);

export const dualStackValidationSchema = (field: string, openshiftVersion?: string) =>
  Yup.array()
    .max(2, `Maximum number of ${field} subnets in dual stack is 2.`)
    .test(
      'dual-stack-ipv4',
      openshiftVersion && isMajorMinorVersionEqualOrGreater(openshiftVersion, '4.12')
        ? 'First network has to be a valid IPv4 or IPv6 subnet.'
        : 'First network has to be IPv4 subnet.',
      (values?: { cidr: MachineNetwork['cidr'] }[]): boolean => {
        // For OCP versions > 4.11, allow IPv6 as primary network
        if (openshiftVersion && isMajorMinorVersionEqualOrGreater(openshiftVersion, '4.12')) {
          return !!values?.[0].cidr && (isCIDR.v4(values[0].cidr) || isCIDR.v6(values[0].cidr));
        }
        // For older versions, require IPv4 as primary network
        return !!values?.[0].cidr && isCIDR.v4(values[0].cidr);
      },
    )
    .test(
      'dual-stack-unique-cidrs',
      `Provided ${field} subnets must be unique.`,
      (values?: { cidr?: MachineNetwork['cidr'] }[]) => {
        if (!values || values.length < 2) {
          return true;
        }
        const first = values[0]?.cidr || '';
        const second = values[1]?.cidr || '';
        if (!first || !second) {
          return true;
        }
        const firstIsCidr = isCIDR.v4(first) || isCIDR.v6(first);
        const secondIsCidr = isCIDR.v4(second) || isCIDR.v6(second);
        if (!firstIsCidr || !secondIsCidr) {
          return true;
        }
        return first !== second;
      },
    )
    .test(
      'dual-stack-opposite-families',
      `When two ${field} are provided, one must be IPv4 and the other IPv6.`,
      (values?: { cidr?: MachineNetwork['cidr'] }[]) => {
        if (!values || values.length < 2) {
          return true;
        }
        const a = values[0]?.cidr || '';
        const b = values[1]?.cidr || '';
        if (!a || !b) {
          return true;
        }
        const a4 = isCIDR.v4(a);
        const a6 = isCIDR.v6(a);
        const b4 = isCIDR.v4(b);
        const b6 = isCIDR.v6(b);
        if (!((a4 || a6) && (b4 || b6))) {
          return true;
        }
        return (a4 && b6) || (a6 && b4);
      },
    );

export const IPv4ValidationSchema = Yup.array().test(
  'single-stack',
  `All network subnets must be IPv4.`,
  (values?: (MachineNetwork | ClusterNetwork | ServiceNetwork)[]) => allSubnetsIPv4(values),
);
