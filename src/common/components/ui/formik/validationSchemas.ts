import * as Yup from 'yup';
import { Address4, Address6 } from 'ip-address';
import { isInSubnet } from 'is-in-subnet';
import isCIDR from 'is-cidr';

import { NetworkConfigurationValues, HostSubnets } from '../../../types/clusters';
import { NO_SUBNET_SET } from '../../../config/constants';
import { ProxyFieldsType } from '../../../types';
import { trimCommaSeparatedList, trimSshPublicKey } from './utils';

const ALPHANUMBERIC_REGEX = /^[a-zA-Z0-9]+$/;
const CLUSTER_NAME_REGEX = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
const SSH_PUBLIC_KEY_REGEX = /^(ssh-rsa|ssh-ed25519|ecdsa-[-a-z0-9]*) AAAA[0-9A-Za-z+/]+[=]{0,3}( .+)?$/;
const DNS_NAME_REGEX = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
const PROXY_DNS_REGEX = /^([a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62}){1}(\.[a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62})*[._]?$/;
const NAME_CHARS_REGEX = /^[a-zA-Z0-9-.]*$/;
const IP_V4_ZERO = '0.0.0.0';
const IP_V6_ZERO = '0000:0000:0000:0000:0000:0000:0000:0000';
const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\\.[0-9a-fA-F]{4}\\.[0-9a-fA-F]{4})$”/;
//Source of information: https://github.com/metal3-io/baremetal-operator/blob/main/docs/api.md#baremetalhost-spec
const BMC_REGEX = /^((ipmi|ibmc(\+https?)?|idrac(\+https?)?|idrac-redfish(\+https?)?|idrac-virtualmedia(\+https?)?|irmc|redfish(\+https?)?|redfish-virtualmedia(\+https?)?|ilo4(\+https)?|ilo4-virtuallmedia(\+https)?|ilo5(\+https)?|ilo5-redfish(\+https)|ilo5-virtualmedia(\+https)|https?|ftp):(\/\/([a-z0-9\-._~%!$&'()*+,;=]+@)?([a-z0-9\-._~%]+|\[[a-f0-9:.]+\]|\[v[a-f0-9][a-z0-9\-._~%!$&'()*+,;=:]+\])(:[0-9]+)?(\/[a-z0-9\-._~%!$&'()*+,;=:@]+)*\/?|(\/?[a-z0-9\-._~%!$&'()*+,;=:@]+(\/[a-z0-9\-._~%!$&'()*+,;=:@]+)*\/?)?)|([a-z0-9\-._~%!$&'()*+,;=@]+(\/[a-z0-9\-._~%!$&'()*+,;=:@]+)*\/?|(\/[a-z0-9\-._~%!$&'()*+,;=:@]+)+\/?))(\?[a-z0-9\-._~%!$&'()*+,;=:@/?]*)?(#[a-z0-9\-._~%!$&'()*+,;=:@/?]*)?$/i;
const LOCATION_CHARS_REGEX = /^[a-zA-Z0-9-._]*$/;

export const nameValidationSchema = (
  usedClusterNames: string[],
  baseDnsDomain = '',
  validateUniqueName?: boolean,
) =>
  Yup.string()
    .matches(CLUSTER_NAME_REGEX, {
      message:
        'Name must consist of lower-case letters, numbers and hyphens. It must start with a letter and end with a letter or number.',
      excludeEmptyString: true,
    })
    .max(54, 'Cannot be longer than 54 characters.')
    .required('Required')
    .when('useRedHatDnsService', {
      is: true,
      then: Yup.string().test('is-name-unique', 'The name is already taken.', (value: string) => {
        const clusterFullName = `${value}.${baseDnsDomain}`;
        return !value || !usedClusterNames.includes(clusterFullName);
      }),
      otherwise: Yup.string().test(
        'is-name-unique',
        'The name is already taken.',
        (value: string) => {
          // in CIM cluster name is ClusterDeployment CR name which must be unique
          return validateUniqueName ? !value || !usedClusterNames.includes(value) : true;
        },
      ),
    });

export const sshPublicKeyValidationSchema = Yup.string().test(
  'ssh-public-key',
  'SSH public key must consist of "[TYPE] key [[EMAIL]]", supported types are: ssh-rsa, ssh-ed25519, ecdsa-[VARIANT]. A single key can be provided only.',
  (value) => {
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

export const pullSecretValidationSchema = Yup.string()
  .test(
    'is-well-formed-json',
    'The pull-secret format is malformed, refer to the documentation for examples.',
    (value) => {
      const isValid = true;
      if (!value) return isValid;
      try {
        JSON.parse(value);
        return isValid;
      } catch {
        return !isValid;
      }
    },
  )
  .test(
    'is-valid-pull-secret',
    'The pull-secret format is invalid, refer to the documentation for examples.',
    (value) => {
      if (!value) return true;
      try {
        const pullSecret = JSON.parse(value);
        return (
          pullSecret.constructor.name === 'Object' &&
          !!pullSecret?.auths &&
          pullSecret.auths.constructor.name === 'Object'
        );
      } catch {
        return false;
      }
    },
  );

export const ipValidationSchema = Yup.string().test(
  'ip-validation',
  'Not a valid IP address',
  (value) => Address4.isValid(value) || Address6.isValid(value),
);

export const macAddressValidationSchema = Yup.string().matches(MAC_REGEX, {
  message: 'Value "${value}" is not valid MAC address.', // eslint-disable-line no-template-curly-in-string
  excludeEmptyString: true,
});

export const vipRangeValidationSchema = (
  hostSubnets: HostSubnets,
  { hostSubnet }: NetworkConfigurationValues,
) =>
  Yup.string().test('vip-validation', 'IP Address is outside of selected subnet', function (value) {
    if (!value) {
      return true;
    }
    try {
      ipValidationSchema.validateSync(value);
    } catch (err) {
      return this.createError({ message: err.message });
    }
    const foundHostSubnet = hostSubnets.find((hn) => hn.subnet === hostSubnet);
    if (foundHostSubnet?.subnet) {
      // Workaround for bug in CIM backend. hostIDs are empty
      return foundHostSubnet.hostIDs.length ? isInSubnet(value, foundHostSubnet.subnet) : true;
    }
    return false;
  });

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
    (value) => value || !initialValue,
  );

const stringToIPAddress = (value: string): Address4 | Address6 | null => {
  let ip = null;
  if (Address4.isValid(value)) {
    ip = new Address4(value);
  } else if (Address6.isValid(value)) {
    ip = new Address6(value);
  }

  return ip;
};

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
    then: requiredOnceSet(initialValue)
      .concat(vipRangeValidationSchema(hostSubnets, values))
      .concat(vipUniqueValidationSchema(values))
      .when('hostSubnet', {
        is: (hostSubnet) => hostSubnet !== NO_SUBNET_SET,
        then: Yup.string().required('Required. Please provide an IP address'),
      }),
  });

export const ipBlockValidationSchema = Yup.string()
  .required('A value is required.')
  .test(
    'valid-ip-address',
    'Invalid IP address block. Expected value is a network expressed in CIDR notation (IP/netmask). For example: 123.123.123.0/24, 2055:d7a::/116',
    (value = '') => isCIDR.v4(value) || isCIDR.v6(value),
  )
  .test(
    'valid-netmask',
    'IPv4 netmask must be between 1-25 and include at least 128 addresses.\nIPv6 netmask must be between 8-128 and include at least 256 addresses.',
    (value = '') => {
      const suffix = parseInt(value.split('/')[1]);

      return (
        (isCIDR.v4(value) && 0 < suffix && suffix < 26) ||
        (isCIDR.v6(value) && 7 < suffix && suffix < 129)
      );
    },
  )
  .test(
    'cidr-is-not-unspecified',
    'The specified CIDR is invalid because its resulting routing prefix matches the unspecified address.',
    (value = '') => {
      const ip = stringToIPAddress(value);
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
    ({ value }) => `${value} is not a valid CIDR`,
    (value = '') => {
      const ip = stringToIPAddress(value);
      if (ip === null) {
        return false;
      }

      const networkAddress = ip.startAddress().parsedAddress;
      const ipAddress = ip.parsedAddress;
      const result = ipAddress.every((part, idx) => part === networkAddress[idx]);

      return result;
    },
  );

export const dnsNameValidationSchema = Yup.string()
  .test(
    'dns-name-label-length',
    'Single label of the DNS name can not be longer than 63 characters.',
    (value = '') => value.split('.').every((label: string) => label.length <= 63),
  )
  .matches(DNS_NAME_REGEX, {
    message: 'Value "${value}" is not valid DNS name. Example: basedomain.example.com', // eslint-disable-line no-template-curly-in-string
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

export const NAME_VALIDATION_MESSAGES = {
  INVALID_LENGTH: '1-253 characters',
  NOT_UNIQUE: 'Must be unique',
  INVALID_VALUE: 'Use alphanumberic characters, dot (.) or hyphen (-)',
  INVALID_START_END: 'Must start and end with an alphanumeric character',
};

export const HOSTNAME_VALIDATION_MESSAGES = {
  ...NAME_VALIDATION_MESSAGES,
  LOCALHOST_ERR: 'Cannot be the word "localhost"',
};

export const richNameValidationSchema = (usedNames: string[], origName?: string) =>
  Yup.string()
    .min(1, NAME_VALIDATION_MESSAGES.INVALID_LENGTH)
    .max(253, NAME_VALIDATION_MESSAGES.INVALID_LENGTH)
    .test(
      NAME_VALIDATION_MESSAGES.INVALID_START_END,
      NAME_VALIDATION_MESSAGES.INVALID_START_END,
      (value) => {
        const trimmed: string = value?.trim();
        if (!trimmed) {
          return true;
        }
        return (
          !!trimmed[0].match(ALPHANUMBERIC_REGEX) &&
          (trimmed[trimmed.length - 1]
            ? !!trimmed[trimmed.length - 1].match(ALPHANUMBERIC_REGEX)
            : true)
        );
      },
    )
    .matches(NAME_CHARS_REGEX, {
      message: NAME_VALIDATION_MESSAGES.INVALID_VALUE,
      excludeEmptyString: true,
    })
    .test(NAME_VALIDATION_MESSAGES.NOT_UNIQUE, NAME_VALIDATION_MESSAGES.NOT_UNIQUE, (value) => {
      if (!value || value === origName) {
        return true;
      }
      return !usedNames.find((n) => n === value);
    });

export const hostnameValidationSchema = (origHostname: string, usedHostnames: string[]) =>
  nameValidationSchema(usedHostnames, origHostname).notOneOf(
    ['localhost', 'localhost.localdomain'],
    HOSTNAME_VALIDATION_MESSAGES.LOCALHOST_ERR,
  );

const httpProxyValidationMessage = 'Provide a valid HTTP URL.';
export const httpProxyValidationSchema = (
  values: ProxyFieldsType,
  pairValueName: 'httpProxy' | 'httpsProxy',
) =>
  Yup.string()
    .test(
      'http-proxy-no-empty-validation',
      'At least one of the HTTP or HTTPS proxy URLs is required.',
      (value) => !values.enableProxy || value || values[pairValueName],
    )
    .test('http-proxy-validation', httpProxyValidationMessage, (value) => {
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
    if (!value) {
      return true;
    }

    // https://docs.openshift.com/container-platform/4.5/installing/installing_bare_metal/installing-restricted-networks-bare-metal.html#installation-configure-proxy_installing-restricted-networks-bare-metal
    // A comma-separated list of destination domain names, domains, IP addresses or other network CIDRs
    // to exclude proxying. Preface a domain with . to include all subdomains of that domain.
    // Use * to bypass proxy for all destinations."
    const noProxyList = trimCommaSeparatedList(value).split(',');
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

export const bmcAddressValidationSchema = Yup.string().matches(BMC_REGEX, {
  message: 'Value "${value}" is not valid BMC address.', // eslint-disable-line no-template-curly-in-string
  excludeEmptyString: true,
});

export const LOCATION_VALIDATION_MESSAGES = {
  INVALID_LENGTH: '1-63 characters',
  INVALID_VALUE: 'Use alphanumberic characters, dot (.), underscore (_) or hyphen (-)',
  INVALID_START_END: 'Must start and end with an alphanumeric character',
};

export const locationValidationSchema = Yup.string()
  .min(1, LOCATION_VALIDATION_MESSAGES.INVALID_LENGTH)
  .max(63, LOCATION_VALIDATION_MESSAGES.INVALID_LENGTH)
  .test(
    LOCATION_VALIDATION_MESSAGES.INVALID_START_END,
    LOCATION_VALIDATION_MESSAGES.INVALID_START_END,
    (value) => {
      const trimmed: string = value?.trim();
      if (!trimmed) {
        return true;
      }
      return (
        !!trimmed[0].match(ALPHANUMBERIC_REGEX) &&
        (trimmed[trimmed.length - 1]
          ? !!trimmed[trimmed.length - 1].match(ALPHANUMBERIC_REGEX)
          : true)
      );
    },
  )
  .matches(LOCATION_CHARS_REGEX, {
    message: LOCATION_VALIDATION_MESSAGES.INVALID_VALUE,
    excludeEmptyString: true,
  });
