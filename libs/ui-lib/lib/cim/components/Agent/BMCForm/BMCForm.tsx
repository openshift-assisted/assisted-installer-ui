import * as React from 'react';
import * as yaml from 'js-yaml';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Button,
  ButtonVariant,
  Form,
  ModalBoxBody,
  ModalBoxFooter,
  TextInputTypes,
} from '@patternfly/react-core';
import { Formik, FormikProps, FormikConfig } from 'formik';

import {
  InputField,
  getRichTextValidation,
  RichInputField,
  BMCValidationMessages,
  StaticIpView,
} from '../../../../common';
import { InfraEnvK8sResource, NMStateK8sResource } from '../../../types';
import { AddBmcValues, BMCFormProps } from '../types';
import { AGENT_BMH_NAME_LABEL_KEY, INFRAENV_AGENTINSTALL_LABEL_KEY } from '../../common';
import { getErrorMessage } from '../../../../common/utils';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { getInitValues, getValidationSchema } from './validationSchemas';
import ProvisioningConfigErrorAlert from '../../modals/ProvisioningConfigErrorAlert';
import { NMStateConfig } from './NMstateConfig';

const getNMState = (values: AddBmcValues, infraEnv: InfraEnvK8sResource): NMStateK8sResource => {
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

const BMCForm: React.FC<BMCFormProps> = ({
  onCreateBMH,
  onClose,
  hasDHCP,
  infraEnv,
  bmh,
  nmState,
  secret,
  isEdit,
  usedHostnames,
  provisioningConfigError,
}) => {
  const { t } = useTranslation();
  const [error, setError] = React.useState<string>();

  const { initValues, validationSchema } = React.useMemo(() => {
    const addNmState =
      infraEnv.metadata?.labels && infraEnv.metadata?.labels['networkType'] === 'static';

    const initValues = getInitValues(bmh, nmState, secret, isEdit, addNmState);
    const validationSchema = getValidationSchema(usedHostnames, initValues.hostname, t);
    return { initValues, validationSchema };
  }, [infraEnv.metadata?.labels, usedHostnames, bmh, nmState, secret, isEdit, t]);

  const handleSubmit: FormikConfig<AddBmcValues>['onSubmit'] = async (values) => {
    try {
      setError(undefined);
      const nmState = values.nmState ? getNMState(values, infraEnv) : undefined;
      await onCreateBMH(values, nmState);
      onClose();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <Formik
      initialValues={initValues}
      isInitialValid={false}
      validate={getRichTextValidation(validationSchema)}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, isValid, submitForm }: FormikProps<AddBmcValues>) => (
        <>
          <ModalBoxBody>
            {provisioningConfigError && (
              <ProvisioningConfigErrorAlert error={provisioningConfigError} />
            )}

            <Form id="add-bmc-form">
              <InputField
                label={t('ai:Name')}
                name="name"
                placeholder={t('ai:Enter the name for the Host')}
                isRequired
                isDisabled={isEdit}
              />
              <RichInputField
                label={t('ai:Hostname')}
                name="hostname"
                placeholder={t('ai:Enter the hostname for the Host')}
                richValidationMessages={BMCValidationMessages(t)}
                isRequired
              />
              <InputField
                label={t('ai:Baseboard Management Controller Address')}
                name="bmcAddress"
                placeholder={t('ai:Enter an address')}
                isRequired
              />
              <InputField
                label={t('ai:Boot NIC MAC Address')}
                name="bootMACAddress"
                placeholder={t('ai:Enter an address')}
                description={t(
                  "ai:The MAC address of the host's network connected NIC that will be used to provision the host.",
                )}
                isRequired
              />
              <InputField
                label={t('ai:Username')}
                name="username"
                placeholder={t('ai:Enter a username for the BMC')}
                isRequired
              />
              <InputField
                type={TextInputTypes.password}
                label={t('ai:Password')}
                name="password"
                placeholder={t('ai:Enter a password for the BMC')}
                isRequired
              />
              {!hasDHCP && <NMStateConfig />}
            </Form>
            {error && (
              <Alert
                title={t('ai:Failed to add host')}
                variant={AlertVariant.danger}
                isInline
                actionClose={<AlertActionCloseButton onClose={() => setError(undefined)} />}
              >
                {error}
              </Alert>
            )}
          </ModalBoxBody>
          <ModalBoxFooter>
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <Button onClick={submitForm} isDisabled={isSubmitting || !isValid}>
              {isEdit ? t('ai:Submit') : t('ai:Create')}
            </Button>
            <Button onClick={onClose} variant={ButtonVariant.secondary}>
              {t('ai:Cancel')}
            </Button>
          </ModalBoxFooter>
        </>
      )}
    </Formik>
  );
};

export default BMCForm;
