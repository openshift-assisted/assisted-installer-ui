import { TFunction } from 'i18next';
import * as Yup from 'yup';

import {
  CLUSTER_NAME_MAX_LENGTH,
  clusterNameValidationMessages,
  FORBIDDEN_HOSTNAMES,
  hostnameValidationMessages,
  locationValidationMessages,
  nameValidationMessages,
} from './constants';
import { ClusterDetailsValues } from '../components';
import {
  ALPHANUMERIC_REGEX,
  CLUSTER_NAME_START_END_REGEX,
  CLUSTER_NAME_VALID_CHARS_REGEX,
  DNS_NAME_REGEX,
  HOST_NAME_REGEX,
  LOCATION_CHARS_REGEX,
  NAME_CHARS_REGEX,
  NAME_START_END_REGEX,
} from './regexes';

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

export const locationValidationSchema = (t: TFunction) =>
  Yup.string()
    .min(1, locationValidationMessages(t).INVALID_LENGTH)
    .max(63, locationValidationMessages(t).INVALID_LENGTH)
    .test(
      locationValidationMessages(t).INVALID_START_END,
      locationValidationMessages(t).INVALID_START_END,
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
      message: locationValidationMessages(t).INVALID_VALUE,
      excludeEmptyString: true,
    })
    .required(t('ai:Location is a required field.'));
