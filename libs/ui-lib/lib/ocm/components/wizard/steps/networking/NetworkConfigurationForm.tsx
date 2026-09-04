import React from 'react';
import { useSelector } from 'react-redux';
import { useFormikContext } from 'formik';
import { Form, Grid, GridItem, Content } from '@patternfly/react-core';
import {
  Cluster,
  ClusterDefaultConfig,
  InfraEnv,
} from '@openshift-assisted/types/assisted-installer-service';
import {
  ClusterWizardStep,
  ClusterWizardStepHeader,
  getFormikErrorFields,
  HostSubnets,
  NetworkConfigurationValues,
  SecurityFields,
  useAlerts,
  useFormikAutoSave,
} from '../../../../../common';
import { selectCurrentClusterPermissionsState } from '../../../../store';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { ClusterWizardFooter, ClusterWizardNavigation } from '../../wizardComponents';
import { canNextNetwork } from '../../utils';
import { NetworkConfigurationFields, NetworkConfigurationTable } from './components';
import { useFeature } from '../../../../hooks';

export const NetworkConfigurationForm: React.FC<{
  cluster: Cluster;
  hostSubnets: HostSubnets;
  defaultNetworkSettings: Pick<
    ClusterDefaultConfig,
    | 'clusterNetworksIpv4'
    | 'clusterNetworksDualstack'
    | 'serviceNetworksIpv4'
    | 'serviceNetworksDualstack'
  >;
  infraEnv?: InfraEnv;
}> = ({ cluster, hostSubnets, defaultNetworkSettings, infraEnv }) => {
  const { alerts } = useAlerts();
  const clusterWizardContext = useClusterWizardContext();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const isSingleClusterMode = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const { errors, touched, isSubmitting, isValid, setFieldValue, values } =
    useFormikContext<NetworkConfigurationValues>();
  const isAutoSaveRunning = useFormikAutoSave();
  const errorFields = getFormikErrorFields(errors, touched);

  // DHCP allocation is currently not supported for Nutanix hosts
  // https://issues.redhat.com/browse/MGMT-12382
  const isHostsPlatformTypeNutanix = React.useMemo(
    () => cluster.platform?.type === 'nutanix',
    [cluster.platform],
  );

  React.useEffect(() => {
    if (isHostsPlatformTypeNutanix && values.vipDhcpAllocation) {
      setFieldValue('vipDhcpAllocation', false);
    }
  }, [isHostsPlatformTypeNutanix, setFieldValue, values.vipDhcpAllocation]);

  const footer = (
    <ClusterWizardFooter
      cluster={cluster}
      errorFields={errorFields}
      isSubmitting={isSubmitting}
      isNextDisabled={
        isSubmitting ||
        isAutoSaveRunning ||
        !!alerts.length ||
        !isValid ||
        !canNextNetwork({ cluster })
      }
      onNext={() => clusterWizardContext.moveNext()}
      onBack={() => clusterWizardContext.moveBack()}
      isBackDisabled={isSubmitting || isAutoSaveRunning}
    />
  );

  return (
    <ClusterWizardStep navigation={<ClusterWizardNavigation cluster={cluster} />} footer={footer}>
      <Form>
        <Grid hasGutter>
          <GridItem>
            <ClusterWizardStepHeader>Networking</ClusterWizardStepHeader>
          </GridItem>
          <GridItem span={12} lg={10} xl={9} xl2={7}>
            <Grid hasGutter>
              <NetworkConfigurationFields
                cluster={cluster}
                hostSubnets={hostSubnets}
                defaultNetworkSettings={defaultNetworkSettings}
                isVipDhcpAllocationDisabled={isHostsPlatformTypeNutanix}
              />
              <SecurityFields
                clusterSshKey={cluster.sshPublicKey}
                imageSshKey={infraEnv?.sshAuthorizedKey}
                isDisabled={isViewerMode}
                isSingleClusterMode={isSingleClusterMode}
              />
            </Grid>
          </GridItem>
          <GridItem>
            <Content component="h2">Host inventory</Content>
            <NetworkConfigurationTable cluster={cluster} />
          </GridItem>
        </Grid>
      </Form>
    </ClusterWizardStep>
  );
};
