import { TFunction } from 'i18next';
import * as Yup from 'yup';
import * as yaml from 'js-yaml';

import { AddBmcValues } from '../types';
import { BareMetalHostK8sResource, NMStateK8sResource, SecretK8sResource } from '../../../types';
import {
  bmcAddressValidationSchema,
  macAddressValidationSchema,
  richNameValidationSchema,
} from '../../../../common';
import { BMH_HOSTNAME_ANNOTATION } from '../../common';

export const emptyValues: AddBmcValues = {
  name: '',
  hostname: '',
  bmcAddress: '',
  username: '',
  password: '',
  bootMACAddress: '',
  disableCertificateVerification: true, // TODO(mlibra)
  online: true,
  nmState: `interfaces:
  - name: <nic1_name>
    type: ethernet
    state: up
    ipv4:
      address:
      - ip: <ip_address>
        prefix-length: 24
      enabled: true
dns-resolver:
  config:
    server:
    - <dns_ip_address>
routes:
  config:
  - destination: 0.0.0.0/0
    next-hop-address: <next_hop_ip_address>
    next-hop-interface: <next_hop_nic1_name>
  `,
  macMapping: [{ macAddress: '', name: '' }],
};

export const getInitValues = (
  bmh?: BareMetalHostK8sResource,
  nmState?: NMStateK8sResource,
  secret?: SecretK8sResource,
  isEdit?: boolean,
  addNMState?: boolean,
): AddBmcValues => {
  let values = emptyValues;

  if (isEdit) {
    values = {
      name: bmh?.metadata?.name || '',
      hostname: bmh?.metadata?.annotations?.[BMH_HOSTNAME_ANNOTATION] || '',
      bmcAddress: bmh?.spec?.bmc?.address || '',
      username: secret?.data?.username ? atob(secret.data.username) : '',
      password: secret?.data?.password ? atob(secret.data.password) : '',
      bootMACAddress: bmh?.spec?.bootMACAddress || '',
      disableCertificateVerification: !!bmh?.spec?.bmc?.disableCertificateVerification,
      online: !!bmh?.spec?.online,
      nmState: nmState ? yaml.dump(nmState?.spec?.config) : emptyValues.nmState,
      macMapping: nmState?.spec?.interfaces || [{ macAddress: '', name: '' }],
    };
  }

  if (!addNMState) {
    values.nmState = '';
  }
  return values;
};

export const getValidationSchema = (
  usedHostnames: string[],
  origHostname: string,
  t: TFunction,
) => {
  return Yup.object({
    name: Yup.string().required(t('ai:Required field')),
    hostname: richNameValidationSchema(t, usedHostnames, origHostname),
    bmcAddress: bmcAddressValidationSchema(t),
    username: Yup.string().required(t('ai:Required field')),
    password: Yup.string().required(t('ai:Required field')),
    bootMACAddress: macAddressValidationSchema,
    nmState: Yup.string(),
    macMapping: Yup.array().of(
      Yup.object().shape(
        {
          macAddress: macAddressValidationSchema.when('name', {
            is: (name: string) => !!name,
            then: () => macAddressValidationSchema.required(t('ai:MAC has to be specified')),
          }),
          name: Yup.string().when('macAddress', {
            is: (name: string) => !!name,
            then: () => Yup.string().required(t('ai:Name has to be specified')),
          }),
        },
        [['name', 'macAddress']],
      ),
    ),
  });
};
