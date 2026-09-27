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
import { StaticIpViewProps } from '../propTypes';
import { networkWideValidationSchema } from './formViewNetworkWideValidationSchema';
import { disconnectedNetworkWideValidationSchema } from './disconnectedNetworkWideValidationSchema';
import { FormViewNetworkWideFields } from './FormViewNetworkWideFields';
import { useClusterWizardContext } from '../../../../clusterWizardContext';
import { useFeature } from '../../../../../../hooks';

export const FormViewNetworkWide: React.FC<StaticIpViewProps> = ({ infraEnv, ...props }) => {
  const { installDisconnected } = useClusterWizardContext();
  const isSingleClusterFeature = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const useDisconnectedSingleStack = installDisconnected || isSingleClusterFeature;
  const [hosts, setHosts] = React.useState<FormViewHost[]>();

  React.useEffect(() => {
    setHosts(getFormData(infraEnv).hosts);
  }, [infraEnv]);

  const getInitialValues = React.useCallback(
    (currentInfraEnv: InfraEnv) => {
      return useDisconnectedSingleStack
        ? getDisconnectedFormViewNetworkWideValues(currentInfraEnv)
        : getFormViewNetworkWideValues(currentInfraEnv);
    },
    [useDisconnectedSingleStack],
  );

  const getUpdateParams = React.useCallback(
    (currentInfraEnv: InfraEnv, values: FormViewNetworkWideValues) =>
      useDisconnectedSingleStack
        ? disconnectedNetworkWideToInfraEnvField(currentInfraEnv, values)
        : networkWideToInfraEnvField(currentInfraEnv, values),
    [useDisconnectedSingleStack],
  );

  if (!hosts) {
    return null;
  }

  return (
    <StaticIpForm<FormViewNetworkWideValues>
      key={useDisconnectedSingleStack ? 'disconnected-single-stack' : 'connected'}
      infraEnv={infraEnv}
      {...props}
      validationSchema={
        useDisconnectedSingleStack
          ? disconnectedNetworkWideValidationSchema
          : networkWideValidationSchema
      }
      getInitialValues={getInitialValues}
      getUpdateParams={getUpdateParams}
      getEmptyValues={getEmptyNetworkWideConfigurations}
    >
      <FormViewNetworkWideFields hosts={hosts} />
    </StaticIpForm>
  );
};
