import { TFunction } from 'i18next';
import * as Yup from 'yup';
import {
  CpuArchitecture,
  httpProxyValidationSchema,
  locationValidationSchema,
  noProxyValidationSchema,
  ntpSourceValidationSchema,
  pullSecretValidationSchema,
  richNameValidationSchema,
  sshPublicKeyValidationSchema,
} from '../../../../common';
import { InfraEnvK8sResource, SecretK8sResource } from '../../../types';
import { InfraEnvModel, RoleModel, SecretModel } from '../../../types/models';

export type EnvironmentStepFormValues = {
  name: string;
  location: string;
  credentials: string;
  pullSecret: string;
  sshPublicKey: string;
  httpProxy: string;
  httpsProxy: string;
  noProxy: string;
  enableProxy: boolean;
  labels: string[];
  networkType: 'dhcp' | 'static';
  cpuArchitecture: Extract<
    CpuArchitecture,
    CpuArchitecture.x86 | CpuArchitecture.ARM | CpuArchitecture.s390x
  >;
  enableNtpSources: boolean;
  additionalNtpSources: string;
  osImageVersion?: string;
};

export const validationSchema = (usedNames: string[], t: TFunction) =>
  Yup.lazy((values: EnvironmentStepFormValues) =>
    Yup.object<EnvironmentStepFormValues>().shape({
      name: richNameValidationSchema(t, usedNames),
      location: locationValidationSchema(t).required(t('ai:Location is a required field.')),
      pullSecret: pullSecretValidationSchema.required(t('ai:Pull secret is a required field.')),
      sshPublicKey: sshPublicKeyValidationSchema,
      httpProxy: httpProxyValidationSchema({
        values,
        pairValueName: 'httpsProxy',
        allowEmpty: true,
      }),
      httpsProxy: httpProxyValidationSchema({
        values,
        pairValueName: 'httpProxy',
        allowEmpty: true,
      }), // share the schema, httpS is currently not supported
      noProxy: noProxyValidationSchema,
      labels: Yup.array()
        .of(Yup.string())
        .test(
          'label-equals-validation',
          'Label selector needs to be in a `key=value` form',
          (values) =>
            (values as string[]).every((value) => {
              const parts = value.split('=');
              return parts.length === 2;
            }),
        ),
      additionalNtpSources: ntpSourceValidationSchema,
    }),
  );

export const initialValues: EnvironmentStepFormValues = {
  name: '',
  location: '',
  credentials: '',
  pullSecret: '',
  sshPublicKey: '',
  httpProxy: '',
  httpsProxy: '',
  noProxy: '',
  enableProxy: false,
  labels: [],
  networkType: 'dhcp',
  cpuArchitecture: CpuArchitecture.x86,
  enableNtpSources: false,
  additionalNtpSources: '',
  osImageVersion: '',
};

export const getPullSecretSecret = (
  values: EnvironmentStepFormValues,
  namespace: string,
): SecretK8sResource => {
  return {
    apiVersion: SecretModel.apiVersion,
    kind: SecretModel.kind,
    metadata: {
      name: `pullsecret-${values.name}`,
      namespace,
    },
    stringData: {
      '.dockerconfigjson': values.pullSecret,
    },
    type: 'kubernetes.io/dockerconfigjson',
  };
};

export const getInfraEnv = (values: EnvironmentStepFormValues, namespace: string) => {
  const infraEnv: InfraEnvK8sResource = {
    apiVersion: `${InfraEnvModel.apiGroup || ''}/${InfraEnvModel.apiVersion}`,
    kind: InfraEnvModel.kind,
    metadata: {
      name: values.name,
      namespace,
      labels: {
        'agentclusterinstalls.extensions.hive.openshift.io/location': values.location,
        networkType: values.networkType,
      },
    },
    spec: {
      agentLabels: {
        'agentclusterinstalls.extensions.hive.openshift.io/location': values.location,
      },
      pullSecretRef: {
        name: `pullsecret-${values.name}`,
      },
      nmStateConfigLabelSelector: {
        matchLabels: {
          'infraenvs.agent-install.openshift.io': values.name,
        },
      },
    },
  };

  if (infraEnv.spec) {
    values.labels.forEach((l) => {
      const label = l.split('=');
      if (label.length && infraEnv.metadata?.labels) {
        infraEnv.metadata.labels[label[0]] = label.length === 2 ? label[1] : '';
      }
    });

    if (values.sshPublicKey) {
      infraEnv.spec.sshAuthorizedKey = values.sshPublicKey;
    }

    if (values.enableProxy && (values.httpProxy || values.httpsProxy || values.noProxy)) {
      infraEnv.spec.proxy = {};
      if (values.httpProxy) {
        infraEnv.spec.proxy.httpProxy = values.httpProxy;
      }
      if (values.httpsProxy) {
        infraEnv.spec.proxy.httpsProxy = values.httpsProxy;
      }
      if (values.noProxy) {
        infraEnv.spec.proxy.noProxy = values.noProxy;
      }
    }

    if (values.osImageVersion) {
      infraEnv.spec.osImageVersion = values.osImageVersion;
    }
    if (values.cpuArchitecture) {
      infraEnv.spec.cpuArchitecture = values.cpuArchitecture;
    }
    if (values.additionalNtpSources) {
      const sources = values.additionalNtpSources
        .split(',')
        .map((s) => s.trim())
        .filter((s) => !!s);
      infraEnv.spec.additionalNTPSources = sources;
    }
  }
  return infraEnv;
};

export const getRole = (namespace: string) => {
  return {
    kind: RoleModel.kind,
    apiVersion: `${RoleModel.apiGroup || ''}/${RoleModel.apiVersion}`,
    metadata: {
      name: 'capi-provider-role',
      namespace,
    },
    rules: [
      {
        verbs: ['*'],
        apiGroups: ['agent-install.openshift.io'],
        resources: ['agents'],
      },
    ],
  };
};
