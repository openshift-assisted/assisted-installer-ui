import { TFunction } from 'i18next';
import * as Yup from 'yup';
import * as yaml from 'js-yaml';

import { AddBmcValues } from '../types';
import {
  BareMetalHostK8sResource,
  InfraEnvK8sResource,
  NMStateK8sResource,
  SecretK8sResource,
} from '../../../types';
import {
  bmcAddressValidationSchema,
  Cidr,
  getDNSValidationSchema,
  IpConfigs,
  ipConfigsValidationSchemas,
  macAddressValidationSchema,
  richNameValidationSchema,
  StaticIpView,
  VlanIdValidationSchema,
} from '../../../../common';
import {
  AGENT_BMH_NAME_LABEL_KEY,
  BMH_HOSTNAME_ANNOTATION,
  INFRAENV_AGENTINSTALL_LABEL_KEY,
} from '../../common';

export const emptyValues: AddBmcValues = {
  name: '',
  hostname: '',
  bmcAddress: '',
  username: '',
  password: '',
  bootMACAddress: '',
  disableCertificateVerification: true, // TODO(mlibra)
  online: true,
  staticIPView: StaticIpView.FORM,
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

  protocolType: 'ipv4',
  useVlan: false,
  vlanId: '',
  dns: '',
  ipConfigs: {
    ipv4: { machineNetwork: { ip: '', prefixLength: '' }, gateway: '' },
    ipv6: { machineNetwork: { ip: '', prefixLength: '' }, gateway: '' },
  },

  macMapping: [{ macAddress: '', name: '' }],
};

const getIpConfigs = (nmState?: NMStateK8sResource) => {
  if (!nmState || !nmState.spec?.interfaces || nmState.spec?.interfaces.length < 1) {
    return {};
  } else {
    return {
      ipv4: {
        machineNetwork: {
          ip: nmState?.spec?.config.interfaces?.[0].ipv4?.address?.[0].ip || '',
          prefixLength: nmState?.spec?.config.interfaces?.[0].ipv4?.address?.[0]['prefix-length'],
        } as Cidr,
        gateway: nmState?.spec?.config.routes?.config?.[0]['next-hop-address'] || '',
      },
      ipv6: {
        machineNetwork: {
          ip: nmState.spec.config.interfaces?.[0].ipv6?.address?.[0].ip || '',
          prefixLength:
            nmState.spec.config.interfaces?.[0].ipv6?.address?.[0]['prefix-length'] || '',
        } as Cidr,
        gateway: nmState?.spec?.config.routes?.config?.[1]?.['next-hop-address'] || '',
      },
    };
  }
};

export const getInitValues = (
  bmh?: BareMetalHostK8sResource,
  nmState?: NMStateK8sResource,
  secret?: SecretK8sResource,
  isEdit?: boolean,
  addNMState?: boolean,
): AddBmcValues => {
  let values = emptyValues;
  const staticIpView = (nmState?.metadata?.labels?.['configured-via'] as StaticIpView) || 'form';
  const ipConfigs = getIpConfigs(nmState) as IpConfigs;

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

      staticIPView: staticIpView,
      nmState:
        nmState && staticIpView === StaticIpView.YAML
          ? yaml.dump(nmState?.spec?.config)
          : emptyValues.nmState,

      protocolType: nmState?.spec?.config.interfaces?.[0].ipv6 ? 'dualStack' : 'ipv4',
      useVlan: !!nmState?.spec?.config.interfaces?.[0].vlan,
      vlanId: Number(nmState?.spec?.config.interfaces?.[0].vlan?.id),
      dns: nmState?.spec?.config['dns-resolver']?.config.server?.[0] as string,
      ipConfigs,

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
  return Yup.lazy((values: AddBmcValues) =>
    Yup.object<AddBmcValues>({
      name: Yup.string().required(t('ai:Required field')),
      hostname: richNameValidationSchema(t, usedHostnames, origHostname),
      bmcAddress: bmcAddressValidationSchema(t),
      username: Yup.string().required(t('ai:Required field')),
      password: Yup.string().required(t('ai:Required field')),
      bootMACAddress: macAddressValidationSchema,
      nmState: Yup.string(),

      useVlan: Yup.boolean(),
      vlanId: Yup.mixed().when('useVlan', {
        is: (useVlan: boolean) => useVlan,
        then: () => VlanIdValidationSchema(values.vlanId),
      }),
      dns: getDNSValidationSchema(values.protocolType),
      ipConfigs: ipConfigsValidationSchemas(values.ipConfigs, values.protocolType),
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
    }),
  );
};

export const getNMState = (
  values: AddBmcValues,
  infraEnv: InfraEnvK8sResource,
): NMStateK8sResource => {
  let config;
  if (values.staticIPView === StaticIpView.YAML) {
    config = yaml.load(values.nmState);
  } else {
    config = {
      interfaces: [
        {
          name: values.macMapping[0].name,
          type: values.useVlan ? 'vlan' : 'ethernet',
          state: 'up',
          vlan: values.useVlan
            ? {
                'base-iface': 'eth0',
                id: values.vlanId,
              }
            : undefined,
          ipv4: {
            address: [
              {
                ip: values.ipConfigs.ipv4.machineNetwork.ip,
                'prefix-length': values.ipConfigs.ipv4.machineNetwork.prefixLength,
              },
            ],
            enabled: true,
            dhcp: false,
          },
          ipv6:
            values.protocolType === 'dualStack'
              ? {
                  address: [
                    {
                      ip: values.ipConfigs.ipv6.machineNetwork.ip,
                      'prefix-length': values.ipConfigs.ipv6.machineNetwork.prefixLength,
                    },
                  ],
                  enabled: true,
                  dhcp: false,
                }
              : undefined,
        },
      ],
      'dns-resolver': { config: { server: [values.dns] } },
      routes: {
        config: [
          {
            destination: '0.0.0.0/0',
            'next-hop-address': values.ipConfigs.ipv4.gateway,
            'next-hop-interface':
              values.useVlan && values.vlanId ? `eth0.${values.vlanId}` : 'eth0',
          },
          values.protocolType === 'dualStack' && {
            destination: '::/0',
            'next-hop-address': values.ipConfigs.ipv6.gateway,
            'next-hop-interface':
              values.useVlan && values.vlanId ? `eth0.${values.vlanId}` : 'eth0',
          },
        ].filter(Boolean),
      },
    };
  }

  const nmState = {
    apiVersion: 'agent-install.openshift.io/v1beta1',
    kind: 'NMStateConfig',
    metadata: {
      generateName: `${infraEnv.metadata?.name || ''}-`,
      namespace: infraEnv.metadata?.namespace,
      labels: {
        [AGENT_BMH_NAME_LABEL_KEY]: values.name,
        [INFRAENV_AGENTINSTALL_LABEL_KEY]: infraEnv?.metadata?.name || '',
        'configured-via': values.staticIPView,
      },
    },
    spec: {
      config,
      interfaces: values.macMapping.filter((m) => m.macAddress.length && m.name.length),
    },
  };

  return nmState as NMStateK8sResource;
};
