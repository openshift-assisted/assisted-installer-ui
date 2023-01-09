import { TFunction } from 'i18next';

export const clusterNameValidationMessages = (t: TFunction) => ({
  INVALID_LENGTH_OCM: t('ai:1-54 characters'),
  INVALID_LENGTH_ACM: t('ai:2-54 characters'),
  INVALID_VALUE: t('ai:Use lowercase alphanumeric characters or hyphen (-)'),
  INVALID_START_END: t('ai:Start and end with a lowercase letter or a number.'),
  NOT_UNIQUE: t('ai:Must be unique'),
});

export const ocmClusterNameValidationMessages = (t: TFunction) => ({
  INVALID_LENGTH: clusterNameValidationMessages(t).INVALID_LENGTH_OCM,
  INVALID_VALUE: clusterNameValidationMessages(t).INVALID_VALUE,
  INVALID_START_END: clusterNameValidationMessages(t).INVALID_START_END,
});

export const uniqueOcmClusterNameValidationMessages = (t: TFunction) => ({
  INVALID_LENGTH: clusterNameValidationMessages(t).INVALID_LENGTH_OCM,
  INVALID_VALUE: clusterNameValidationMessages(t).INVALID_VALUE,
  INVALID_START_END: clusterNameValidationMessages(t).INVALID_START_END,
  NOT_UNIQUE: clusterNameValidationMessages(t).NOT_UNIQUE,
});

export const acmClusterNameValidationMessages = (t: TFunction) => ({
  INVALID_LENGTH: clusterNameValidationMessages(t).INVALID_LENGTH_ACM,
  INVALID_VALUE: clusterNameValidationMessages(t).INVALID_VALUE,
  INVALID_START_END: clusterNameValidationMessages(t).INVALID_START_END,
  NOT_UNIQUE: clusterNameValidationMessages(t).NOT_UNIQUE,
});

export const nameValidationMessages = (t: TFunction) => ({
  INVALID_LENGTH: t('ai:1-253 characters'),
  NOT_UNIQUE: t('ai:Must be unique'),
  INVALID_VALUE: t('ai:Use lowercase alphanumeric characters, dot (.) or hyphen (-)'),
  INVALID_START_END: t('ai:Must start and end with an lowercase alphanumeric character'),
  INVALID_FORMAT: t('ai:Number of characters between dots (.) must be 1-63'),
});

export const hostnameValidationMessages = (t: TFunction) => ({
  ...nameValidationMessages(t),
  LOCALHOST_ERR: t('ai:Do not use forbidden words, for example: "localhost".'),
});

export const locationValidationMessages = (t: TFunction) => ({
  INVALID_LENGTH: t('ai:1-63 characters'),
  INVALID_VALUE: t('ai:Use alphanumeric characters, dot (.), underscore (_) or hyphen (-)'),
  INVALID_START_END: t('ai:Must start and end with an alphanumeric character'),
});

export const bmcAddressValidationMessages = (t: TFunction) => ({
  INVALID_VALUE: t(
    'ai:The Value is not valid BMC address, supported protocols are redfish-virtualmedia or idrac-virtualmedia.',
  ),
});

export const FORBIDDEN_HOSTNAMES = [
  'localhost',
  'localhost.localdomain',
  'localhost4',
  'localhost4.localdomain4',
  'localhost6',
  'localhost6.localdomain6',
];
