import React from 'react';
import { InfraEnv } from '@openshift-assisted/types/assisted-installer-service';
import {
  getFormData,
  getFormViewNetworkWideValues,
  getEmptyNetworkWideConfigurations,
  networkWideToInfraEnvField,
  disconnectedNetworkWideToInfraEnvField,
  getDisconnectedFormViewNetworkWideValues,
  FormViewHost,
  FormViewNetworkWideValues,
} from '../../data';
import { StaticIpForm } from '../StaticIpForm';
import { StaticIpFormProps, StaticIpViewProps } from '../propTypes';
import { networkWideValidationSchema } from './formViewNetworkWideValidationSchema';
import { disconnectedNetworkWideValidationSchema } from './disconnectedNetworkWideValidationSchema';
import { FormViewNetworkWideFields } from './FormViewNetworkWideFields';

// `installDisconnected` is a Day 1-only concept. It is passed in explicitly so this
// component can be reused in the Day 2 "Add Hosts" flow (which has no disconnected
// install and no ClusterWizardContext), where it defaults to false.
type FormViewNetworkWideProps = StaticIpViewProps & { installDisconnected?: boolean };

export const FormViewNetworkWide: React.FC<FormViewNetworkWideProps> = ({
  infraEnv,
  installDisconnected = false,
  ...props
}) => {
  const [formProps, setFormProps] = React.useState<StaticIpFormProps<FormViewNetworkWideValues>>();
  const [hosts, setHosts] = React.useState<FormViewHost[]>();

  React.useEffect(() => {
    const _hosts = getFormData(infraEnv).hosts;
    setHosts(_hosts);
    if (!_hosts) {
      return;
    }
    setFormProps({
      infraEnv,
      ...props,
      validationSchema: installDisconnected
        ? disconnectedNetworkWideValidationSchema
        : networkWideValidationSchema,
      getInitialValues: (infraEnv: InfraEnv) => {
        return installDisconnected
          ? getDisconnectedFormViewNetworkWideValues(infraEnv)
          : getFormViewNetworkWideValues(infraEnv);
      },
      getUpdateParams: (currentInfraEnv: InfraEnv, values: FormViewNetworkWideValues) =>
        installDisconnected
          ? disconnectedNetworkWideToInfraEnvField(currentInfraEnv, values)
          : networkWideToInfraEnvField(currentInfraEnv, values),
      getEmptyValues: () => getEmptyNetworkWideConfigurations(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installDisconnected]);
  if (!hosts || !formProps) {
    return null;
  }
  return (
    <StaticIpForm<FormViewNetworkWideValues> {...formProps}>
      <FormViewNetworkWideFields hosts={hosts} installDisconnected={installDisconnected} />
    </StaticIpForm>
  );
};
