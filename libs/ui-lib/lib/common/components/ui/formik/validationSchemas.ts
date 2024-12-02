import { overlap } from 'cidr-tools';
import { Address4, Address6 } from 'ip-address';
import isCIDR from 'is-cidr';
import { isInSubnet } from 'is-in-subnet';
import * as Yup from 'yup';

import { TFunction } from 'i18next';
import {
  ApiVip,
  ClusterNetwork,
  IngressVip,
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
import { selectApiVip, selectIngressVip } from '../../../selectors';
import { head } from 'lodash-es';
import { ClusterDetailsValues } from '../../clusterWizard/types';

const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;
const NAME_START_END_REGEX = /^[a-z0-9](.*[a-z0-9])?$/;
const NAME_CHARS_REGEX = /^[a-z0-9-.]*$/;
const CLUSTER_NAME_START_END_REGEX = /^[a-z0-9](.*[a-z0-9])?$/;
const CLUSTER_NAME_VALID_CHARS_REGEX = /^[a-z0-9-]*$/;
const SSH_PUBLIC_KEY_REGEX =
  /^(ssh-rsa AAAAB3NzaC1yc2|ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNT|ecdsa-sha2-nistp384 AAAAE2VjZHNhLXNoYTItbmlzdHAzODQAAAAIbmlzdHAzOD|ecdsa-sha2-nistp521 AAAAE2VjZHNhLXNoYTItbmlzdHA1MjEAAAAIbmlzdHA1Mj|ssh-ed25519 AAAAC3NzaC1lZDI1NTE5|ssh-dss AAAAB3NzaC1kc3)[0-9A-Za-z+/]+[=]{0,3}( .*)?$/;
const DNS_NAME_REGEX = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;

const PROXY_DNS_REGEX =
  /(^\.?([a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62}){1}(\.[a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62})*$)/;
const IP_V4_ZERO = '0.0.0.0';
const IP_V6_ZERO = '0000:0000:0000:0000:0000:0000:0000:0000';
const MAC_REGEX = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/;
const HOST_NAME_REGEX = /^[^.]{1,63}(?:[.][^.]{1,63})*$/;

// Source of information: https://github.com/metal3-io/baremetal-operator/blob/main/docs/api.md#baremetalhost-spec
const BMC_REGEX =
  /^((redfish-virtualmedia|idrac-virtualmedia)(\+https?)?:(\/\/([a-z0-9\-._~%!$&'()*+,;=]+@)?([a-z0-9\-._~%]+|\[[a-f0-9:.]+\]|\[v[a-f0-9][a-z0-9\-._~%!$&'()*+,;=:]+\])(:[0-9]+)?(\/[a-z0-9\-._~%!$&'()*+,;=:@]+)*\/?|(\/?[a-z0-9\-._~%!$&'()*+,;=:@]+(\/[a-z0-9\-._~%!$&'()*+,;=:@]+)*\/?)?)|([a-z0-9\-._~%!$&'()*+,;=@]+(\/[a-z0-9\-._~%!$&'()*+,;=:@]+)*\/?|(\/[a-z0-9\-._~%!$&'()*+,;=:@]+)+\/?))(\?[a-z0-9\-._~%!$&'()*+,;=:@/?]*)?(#[a-z0-9\-._~%!$&'()*+,;=:@/?]*)?$/i;
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
    .required('Required')
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
      return !!trimSshPublicKey(value).match(SSH_PUBLIC_KEY_REGEX);

      // disable until mutliple keys are supported (https://issues.redhat.com/browse/METAL-250)
      // return (
      //   trimSshPublicKey(value)
      //     .split('\n')
      //     .find((line: string) => !line.match(SSH_PUBLIC_KEY_REGEX)) === undefined
      // );
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
  { machineNetworks, hostSubnet }: NetworkConfigurationValues,
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

    const foundHostSubnets = [];
    if (machineNetworks) {
      const cidrs = machineNetworks?.map((network) => network.cidr);
      foundHostSubnets.push(...hostSubnets.filter((hn) => cidrs?.includes(hn.subnet)));
    } else {
      const subnet = hostSubnets.find((hn) => hn.subnet === hostSubnet);
      if (subnet) {
        foundHostSubnets.push(subnet);
      }
    }
    for (const hostSubnet of foundHostSubnets) {
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

const vipUniqueValidationSchema = (
  { ingressVips, apiVips, apiVip, ingressVip }: NetworkConfigurationValues,
  useIPArray: boolean,
) =>
  Yup.string().test(
    'vip-uniqueness-validation',
    'The Ingress and API IP addresses cannot be the same.',
    (value) => {
      if (useIPArray) {
        if (!value || ingressVips?.length === 0 || apiVips?.length === 0) {
          return true;
        }
        return selectApiVip({ apiVips }) !== selectIngressVip({ ingressVips });
      } else {
        if (!value) {
          return true;
        }
        return apiVip !== ingressVip;
      }
    },
  );

const vipBroadcastValidationSchema = ({ machineNetworks }: NetworkConfigurationValues) =>
  Yup.string().test(
    'vip-no-broadcast',
    'The IP address cannot be a network or broadcast address',
    (value?: string) => {
      const vipAddress = getAddress(value || '')?.address;
      const machineNetwork = getAddress((machineNetworks?.length && machineNetworks[0].cidr) || '');

      const machineNetworkBroadcast = machineNetwork?.endAddress().address;
      const machineNetworkAddress = machineNetwork?.startAddress().address;

      return vipAddress !== machineNetworkBroadcast && vipAddress !== machineNetworkAddress;
    },
  );

// like .required() but passes for initially empty field
const requiredOnceSet = (initialValue?: string, message?: string) =>
  Yup.string().test(
    'required-once-set',
    message || 'The value is required.',
    (value?: string): boolean => !!value || !initialValue,
  );

export const hostSubnetValidationSchema = Yup.string().when(['managedNetworkingType'], {
  is: (managedNetworkingType: NetworkConfigurationValues['managedNetworkingType']) =>
    managedNetworkingType === 'clusterManaged',
  then: () => Yup.string().notOneOf([NO_SUBNET_SET], 'Host subnet must be selected.'),
});

export const vipValidationSchema = (
  hostSubnets: HostSubnets,
  values: NetworkConfigurationValues,
  initialValue?: string,
) =>
  Yup.mixed().when(['vipDhcpAllocation', 'managedNetworkingType'], {
    is: (
      vipDhcpAllocation: NetworkConfigurationValues['vipDhcpAllocation'],
      managedNetworkingType: NetworkConfigurationValues['managedNetworkingType'],
    ) => !vipDhcpAllocation && managedNetworkingType !== 'userManaged',
    then: () =>
      requiredOnceSet(initialValue, 'Required. Please provide an IP address')
        .concat(vipRangeValidationSchema(hostSubnets, values, true))
        .concat(vipUniqueValidationSchema(values, false)),
  });

export const vipNoSuffixValidationSchema = (
  hostSubnets: HostSubnets,
  values: NetworkConfigurationValues,
  initialValues?: ApiVip[] | IngressVip[],
) =>
  Yup.mixed().when(['vipDhcpAllocation', 'managedNetworkingType'], {
    is: (
      vipDhcpAllocation: NetworkConfigurationValues['vipDhcpAllocation'],
      managedNetworkingType: NetworkConfigurationValues['managedNetworkingType'],
    ) => !vipDhcpAllocation && managedNetworkingType !== 'userManaged',
    then: () =>
      requiredOnceSet(head(initialValues)?.ip, 'Required. Please provide an IP address')
        .concat(ipNoSuffixValidationSchema)
        .concat(vipRangeValidationSchema(hostSubnets, values, false))
        .concat(vipBroadcastValidationSchema(values))
        .concat(vipUniqueValidationSchema(values, true)),
  });

export const vipArrayValidationSchema = <T extends Yup.Maybe<Yup.AnyObject>>(
  hostSubnets: HostSubnets,
  values: NetworkConfigurationValues,
  initialValues?: ApiVip[] | IngressVip[],
) =>
  (values.apiVips?.length && values.managedNetworkingType === 'clusterManaged'
    ? Yup.array<T>().of(
        Yup.object({
          clusterId: Yup.string(),
          ip: vipNoSuffixValidationSchema(hostSubnets, values, initialValues),
        }),
      )
    : Yup.array<T>()
  ).test(
    'vips-length',
    'Both API and ingress APIs must be provided.',
    (_value) => values.apiVips?.length === values.ingressVips?.length,
  );

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

export const baseDomainValidationSchema = Yup.string().test(
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
);

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

  if (Address6.isValid(clusterNetworkCidr || '')) {
    return Yup.number().required(requiredText).min(8, errorMsgIPv6).max(128, errorMsgIPv6);
  }

  if (Address4.isValid(clusterNetworkCidr || '')) {
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

  return Yup.string().required().matches(BMC_REGEX, {
    message: bmcAddressValidationMessagesList.INVALID_VALUE,
    excludeEmptyString: true,
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

export const dualStackValidationSchema = (field: string) =>
  Yup.array()
    .max(2, `Maximum number of ${field} subnets in dual stack is 2.`)
    .test(
      'dual-stack-ipv4',
      'First network has to be IPv4 subnet.',
      (values?: { cidr: MachineNetwork['cidr'] }[]): boolean =>
        !!values?.[0].cidr && Address4.isValid(values[0].cidr),
    )
    .test(
      'dual-stack-ipv6',
      'Second network has to be IPv6 subnet.',
      (values?: { cidr: MachineNetwork['cidr'] }[]): boolean =>
        !!values?.[1].cidr && Address6.isValid(values[1].cidr),
    );

export const IPv4ValidationSchema = Yup.array().test(
  'single-stack',
  `All network subnets must be IPv4.`,
  (values?: (MachineNetwork | ClusterNetwork | ServiceNetwork)[]) => allSubnetsIPv4(values),
);
