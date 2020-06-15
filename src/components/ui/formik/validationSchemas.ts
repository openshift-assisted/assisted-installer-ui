import * as Yup from 'yup';
import { ClusterConfigurationValues, HostSubnets } from '../../../types/clusters';

const CLUSTER_NAME_REGEX = /^([a-z]([-a-z0-9]*[a-z0-9])?)*$/;
const SSH_PUBLIC_KEY_REGEX = /^(ssh-rsa|ssh-ed25519|ecdsa-[-a-z0-9]*) AAAA[0-9A-Za-z+/]+[=]{0,3}( [^@]+@[^@| |\t|\n]+)?$/;
// Future bug-fixer: Beer on me! (mlibra)
const IP_ADDRESS_REGEX = /^(((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))|([0-9a-f]{1,4}:){7,7}[0-9a-f]{1,4}|([0-9a-f]{1,4}:){1,7}:|([0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4}|([0-9a-f]{1,4}:){1,5}(:[0-9a-f]{1,4}){1,2}|([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,3}|([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,4}|([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,5}|[0-9a-f]{1,4}:((:[0-9a-f]{1,4}){1,6})|:((:[0-9a-f]{1,4}){1,7}|:)|fe80:(:[0-9a-f]{0,4}){0,4}%[0-9a-z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
const IP_ADDRESS_BLOCK_REGEX = /^(((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\/([0-9]|[1-2][0-9]|3[0-2]))|([0-9a-f]{1,4}:){7,7}[0-9a-f]{1,4}|([0-9a-f]{1,4}:){1,7}:|([0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4}|([0-9a-f]{1,4}:){1,5}(:[0-9a-f]{1,4}){1,2}|([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,3}|([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,4}|([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,5}|[0-9a-f]{1,4}:((:[0-9a-f]{1,4}){1,6})|:((:[0-9a-f]{1,4}){1,7}|:)|fe80:(:[0-9a-f]{0,4}){0,4}%[0-9a-z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))$/;
const DNS_NAME_REGEX = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;

export const nameValidationSchema = Yup.string()
  .matches(CLUSTER_NAME_REGEX, {
    message:
      'Name must consist of lower-case letters, numbers and hyphens. It must start with a letter and end with a letter or number.',
    excludeEmptyString: true,
  })
  .max(253, 'Cannot be longer than 253 characters.')
  .required('Required');

export const sshPublicKeyValidationSchema = Yup.string().matches(SSH_PUBLIC_KEY_REGEX, {
  message:
    'SSH public key must consist of "[TYPE] key [[EMAIL]]", supported types are: ssh-rsa, ssh-ed25519, ecdsa-[VARIANT]',
  excludeEmptyString: true,
});

export const validJSONSchema = Yup.string().test(
  'is-json',
  'Value must be valid JSON.',
  (value) => {
    if (!value) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },
);

export const pullSecretKnownOrRequired = (values: ClusterConfigurationValues) =>
  Yup.string().test(
    'pull-secret-known-or-required',
    'Pull secret must be provided.',
    (value) => value || !values.isPullSecretEdit,
  );

export const ipValidationSchema = Yup.string().matches(IP_ADDRESS_REGEX, {
  message: 'Value "${value}" is not valid IP address.', // eslint-disable-line no-template-curly-in-string
  excludeEmptyString: true,
});

export const vipRangeValidationSchema = (
  hostSubnets: HostSubnets,
  values: ClusterConfigurationValues,
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
    const { subnet } = hostSubnets.find((hn) => hn.humanized === values.hostSubnet) || {};
    return !!subnet?.contains(value) && value !== subnet?.broadcast && value !== subnet?.base;
  });

const vipUniqueValidationSchema = (hostSubnets: HostSubnets, values: ClusterConfigurationValues) =>
  Yup.string().test(
    'vip-uniqueness-validation',
    'Ingress and API IP addresses can not be the same.',
    (value) => {
      if (!value) {
        return true;
      }
      return values.ingressVip !== values.apiVip;
    },
  );

export const vipValidationSchema = (hostSubnets: HostSubnets, values: ClusterConfigurationValues) =>
  vipRangeValidationSchema(hostSubnets, values).concat(
    vipUniqueValidationSchema(hostSubnets, values),
  );

export const ipBlockValidationSchema = Yup.string().matches(IP_ADDRESS_BLOCK_REGEX, {
  message:
    'Value "${value}" is not valid IP block address, expected value is IP/netmask. Example: 123.123.123.0/24', // eslint-disable-line no-template-curly-in-string
  excludeEmptyString: true,
});

export const dnsNameValidationSchema = Yup.string().matches(DNS_NAME_REGEX, {
  message: 'Value "${value}" is not valid DNS name.', // eslint-disable-line no-template-curly-in-string
  excludeEmptyString: true,
});

export const hostPrefixValidationSchema = Yup.number()
  .min(0, 'Host prefix is a number between 0 and 32.')
  .max(32, 'Host prefix is a number between 0 and 32.');
