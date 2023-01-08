import { overlap } from 'cidr-tools';
import { Address4, Address6 } from 'ip-address';
import isCIDR from 'is-cidr';
import { isInSubnet } from 'is-in-subnet';
import * as Yup from 'yup';

import { TFunction } from 'i18next';
import { ClusterNetwork, MachineNetwork, ServiceNetwork } from '../../../api/types';
import { NO_SUBNET_SET } from '../../../config/constants';
import { ProxyFieldsType } from '../../../types';
import { HostSubnets, NetworkConfigurationValues } from '../../../types/clusters';
import { getErrorMessage } from '../../../utils';
import { getSubnet } from '../../clusterConfiguration/utils';
import {
  bmcAddressValidationMessages,
  clusterNameValidationMessages,
  FORBIDDEN_HOSTNAMES,
  hostnameValidationMessages,
  locationValidationMessages,
  nameValidationMessages,
} from './constants';
import { allSubnetsIPv4, trimCommaSeparatedList, trimSshPublicKey } from './utils';

const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;
const NAME_START_END_REGEX = /^[a-z0-9](.*[a-z0-9])?$/;
const NAME_CHARS_REGEX = /^[a-z0-9-.]*$/;
const CLUSTER_NAME_START_END_REGEX = /^[a-z0-9](.*[a-z0-9])?$/;
const CLUSTER_NAME_VALID_CHARS_REGEX = /^[a-z0-9-]*$/;
const SSH_PUBLIC_KEY_REGEX =
  /^(ssh-rsa|ssh-ed25519|ecdsa-[-a-z0-9]*) AAAA[0-9A-Za-z+/]+[=]{0,3}( .+)?$/;
const DNS_NAME_REGEX = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
const PROXY_DNS_REGEX =
  /^([a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62}){1}(\.[a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62})*[._]?$/;
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
      54,
      isOcm
        ? clusterNameValidationMessagesList.INVALID_LENGTH_OCM
        : clusterNameValidationMessagesList.INVALID_LENGTH_ACM,
    )
    .when('useRedHatDnsService', {
      is: true,
      then: Yup.string().test(
        'is-name-unique',
        clusterNameValidationMessagesList.NOT_UNIQUE,
        (value: string) => {
          const clusterFullName = `${value}.${baseDnsDomain}`;
          return !value || !usedClusterNames.includes(clusterFullName);
        },
      ),
      otherwise: Yup.string().test(
        'is-name-unique',
        clusterNameValidationMessagesList.NOT_UNIQUE,
        (value: string) => {
          // in CIM cluster name is ClusterDeployment CR name which must be unique
          return validateUniqueName ? !value || !usedClusterNames.includes(value) : true;
        },
      ),
    });
};

export const sshPublicKeyValidationSchema = Yup.string().test(
  'ssh-public-key',
  'SSH public key must consist of "[TYPE] key [[EMAIL]]", supported types are: ssh-rsa, ssh-ed25519, ecdsa-[VARIANT]. A single key can be provided only.',
  (value: string) => {
    if (!value) {
      return true;
    }

    return !!trimSshPublicKey(value).match(SSH_PUBLIC_KEY_REGEX);
    /* TODO(mlibra): disabled till muliple ssh-keys are supported: https://issues.redhat.com/browse/MGMT-3560
    return (
      trimSshPublicKey(value)
        .split('\n')
        .find((line: string) => !line.match(SSH_PUBLIC_KEY_REGEX)) === undefined
    );
    */
  },
);

export const pullSecretValidationSchema = Yup.string().test(
  'is-well-formed-json',
  "Invalid pull secret format. You must use your Red Hat account's pull secret.",
  (value: string) => {
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

export const ipValidationSchema = Yup.string().test(
  'ip-validation',
  'Not a valid IP address',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  (value) => Address4.isValid(value) || Address6.isValid(value),
);

export const macAddressValidationSchema = Yup.string().matches(MAC_REGEX, {
  message: 'Value "${value}" is not valid MAC address.', // eslint-disable-line no-template-curly-in-string
  excludeEmptyString: true,
});

export const vipRangeValidationSchema = (
  hostSubnets: HostSubnets,
  { machineNetworks, hostSubnet }: NetworkConfigurationValues,
) =>
  Yup.string().test(
    'vip-validation',
    'IP Address is outside of selected subnet',
    function (value: string) {
      if (!value) {
        return true;
      }
      try {
        ipValidationSchema.validateSync(value);
      } catch (err) {
        return this.createError({ message: getErrorMessage(err) });
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
    },
  );

const vipUniqueValidationSchema = ({ ingressVip, apiVip }: NetworkConfigurationValues) =>
  Yup.string().test(
    'vip-uniqueness-validation',
    'The Ingress and API IP addresses cannot be the same.',
    (value) => {
      if (!value) {
        return true;
      }
      return ingressVip !== apiVip;
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
  is: 'clusterManaged',
  then: Yup.string().notOneOf([NO_SUBNET_SET], 'Host subnet must be selected.'),
});

export const vipValidationSchema = (
  hostSubnets: HostSubnets,
  values: NetworkConfigurationValues,
  initialValue?: string,
) =>
  Yup.mixed().when(['vipDhcpAllocation', 'managedNetworkingType'], {
    is: (vipDhcpAllocation, managedNetworkingType) =>
      !vipDhcpAllocation && managedNetworkingType !== 'userManaged',
    then: requiredOnceSet(initialValue, 'Required. Please provide an IP address')
      .concat(vipRangeValidationSchema(hostSubnets, values))
      .concat(vipUniqueValidationSchema(values))
      .when('hostSubnet', {
        is: (hostSubnet) => hostSubnet !== NO_SUBNET_SET,
        then: Yup.string().required('Required. Please provide an IP address'),
      }),
  });

export const ipBlockValidationSchema = (reservedCidrs: string | string[] | undefined) =>
  Yup.string()
    .required('A value is required.')
    .test(
      'valid-ip-address',
      'Invalid IP address block. Expected value is a network expressed in CIDR notation (IP/netmask). For example: 123.123.123.0/24, 2055:d7a::/116',
      (value: string): boolean => !!value && (isCIDR.v4(value) || isCIDR.v6(value)),
    )
    .test(
      'valid-netmask',
      'IPv4 netmask must be between 1-25 and include at least 128 addresses.\nIPv6 netmask must be between 8-128 and include at least 256 addresses.',
      (value: string) => {
        const suffix = parseInt((value || '').split('/')[1]);

        return (
          (isCIDR.v4(value) && 0 < suffix && suffix < 26) ||
          (isCIDR.v6(value) && 7 < suffix && suffix < 129)
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
    (value: string) => (value || '').split('.').every((label: string) => label.length <= 63),
  )
  .matches(DNS_NAME_REGEX, {
    message: 'Value "${value}" is not valid DNS name. Example: basedomain.example.com', // eslint-disable-line no-template-curly-in-string
    excludeEmptyString: true,
  });

export const hostPrefixValidationSchema = ({
  clusterNetworkCidr,
}: Partial<NetworkConfigurationValues>) => {
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
      (value: string) => {
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

const httpProxyValidationMessage = 'Provide a valid HTTP URL.';
export const httpProxyValidationSchema = (
  values: ProxyFieldsType,
  pairValueName: 'httpProxy' | 'httpsProxy',
) =>
  Yup.string()
    .test(
      'http-proxy-no-empty-validation',
      'At least one of the HTTP or HTTPS proxy URLs is required.',
      (value) => Boolean(!values.enableProxy || value || values[pairValueName]),
    )
    .test('http-proxy-validation', httpProxyValidationMessage, (value: string) => {
      if (!value) {
        return true;
      }

      try {
        const url = new URL(value);
        return url.protocol === 'http:';
      } catch {
        return false;
      }
    });

const isNotEmpty = (value: string) => {
  if (!value) {
    return true;
  }
  if (value !== '') {
    return true;
  }
  return false;
};

const isIPorDN = (value: string, dnsRegex = DNS_NAME_REGEX) => {
  if (!value) {
    return true;
  }
  if (value.match(dnsRegex)) {
    return true;
  }
  try {
    ipValidationSchema.validateSync(value);
  } catch (err) {
    return false;
  }
  return true;
};

export const noProxyValidationSchema = Yup.string().test(
  'no-proxy-validation',
  'Provide a comma separated list of valid DNS names or IP addresses.',
  (value: string) => {
    if (!value || value === '*') {
      return true;
    }

    // https://docs.openshift.com/container-platform/4.5/installing/installing_bare_metal/installing-restricted-networks-bare-metal.html#installation-configure-proxy_installing-restricted-networks-bare-metal
    // A comma-separated list of destination domain names, domains, IP addresses or other network CIDRs
    // to exclude proxying. Preface a domain with . to include all subdomains of that domain.
    // Use * to bypass proxy for all destinations."
    const noProxyList = trimCommaSeparatedList(value)
      .split(',')
      .map((p) => (p.charAt(0) === '.' ? p.substring(1) : p));
    return noProxyList.every(isNotEmpty) && noProxyList.every((p) => isIPorDN(p, PROXY_DNS_REGEX));
  },
);

export const ntpSourceValidationSchema = Yup.string().test(
  'ntp-source-validation',
  'Provide a comma separated list of valid DNS names or IP addresses.',
  (value: string) => {
    if (!value) {
      return true;
    }
    return trimCommaSeparatedList(value)
      .split(',')
      .every((v) => isIPorDN(v));
  },
);

export const day2ApiVipValidationSchema = Yup.string().test(
  'day2-api-vip',
  'Provide a valid DNS name or IP Address',
  (value: string) => {
    if (!value) {
      return true;
    }
    return isIPorDN(value);
  },
);

export const bmcAddressValidationSchema = (t: TFunction) => {
  const bmcAddressValidationMessagesList = bmcAddressValidationMessages(t);

  return Yup.string().matches(BMC_REGEX, {
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
      (value: string) => {
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
      hostPrefix: hostPrefixValidationSchema({ clusterNetworkCidr: values.cidr }),
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
  (values: (MachineNetwork | ClusterNetwork | ServiceNetwork)[]) => allSubnetsIPv4(values),
);
