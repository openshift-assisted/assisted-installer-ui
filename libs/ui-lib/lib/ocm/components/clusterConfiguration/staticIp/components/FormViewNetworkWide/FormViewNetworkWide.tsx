import React from 'react';
import { StaticIpForm } from '../StaticIpForm';
import { StaticIpFormProps, StaticIpViewProps } from '../propTypes';
import { FormViewHost, FormViewNetworkWideValues } from '../../data/dataTypes';
import { networkWideValidationSchema } from './formViewNetworkWideValidationSchema';
import { disconnectedNetworkWideValidationSchema } from './disconnectedNetworkWideValidationSchema';
import { networkWideToInfraEnvField } from '../../data/formDataToInfraEnvField';
import { FormViewNetworkWideFields } from './FormViewNetworkWideFields';
import { getFormData, getFormViewNetworkWideValues } from '../../data/fromInfraEnv';
import { getEmptyNetworkWideConfigurations } from '../../data/emptyData';
import {
  disconnectedNetworkWideToInfraEnvField,
  getDisconnectedFormViewNetworkWideValues,
} from '../../data/disconnectedNetworkWide';
import { InfraEnv } from '@openshift-assisted/types/assisted-installer-service';
import { useClusterWizardContext } from '../../../../clusterWizard/ClusterWizardContext';

export const FormViewNetworkWide: React.FC<StaticIpViewProps> = ({ infraEnv, ...props }) => {
  const { installDisconnected } = useClusterWizardContext();
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
      <FormViewNetworkWideFields hosts={hosts} />
    </StaticIpForm>
  );
};
