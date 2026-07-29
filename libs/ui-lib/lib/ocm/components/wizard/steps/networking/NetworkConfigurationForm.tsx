import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  ClustersAPI,
  isUnknownServerError,
  getApiErrorMessage,
  handleApiError,
} from '../../../../../common';
import { selectCurrentClusterPermissionsState, setServerUpdateError } from '../../../../store';
import { useFeature } from '../../../../hooks';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { ClusterWizardFooter, ClusterWizardNavigation } from '../../wizardComponents';
import { canNextNetwork } from '../../utils';
import { NetworkConfigurationFields, NetworkConfigurationTable } from './components';

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
  const { errors, touched, isSubmitting, isValid, setFieldValue, values } =
    useFormikContext<NetworkConfigurationValues>();
  const isAutoSaveRunning = useFormikAutoSave();
  const errorFields = getFormikErrorFields(errors, touched);
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const { addAlert } = useAlerts();
  const dispatch = useDispatch();

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

  const onNext = React.useCallback(async () => {
    if (isSingleClusterFeatureEnabled) {
      try {
        await ClustersAPI.updateInstallConfig(
          cluster.id,
          JSON.stringify(
            JSON.stringify({
              featureSet: 'CustomNoUpgrade',
              featureGates: ['NoRegistryClusterInstall=true'],
            }),
          ),
        );
      } catch (e) {
        handleApiError(e, () =>
          addAlert({
            title: 'Failed to update install-config',
            message: getApiErrorMessage(e),
          }),
        );
        if (isUnknownServerError(e as Error)) {
          dispatch(setServerUpdateError());
        }
        return;
      }
    }
    clusterWizardContext.moveNext();
  }, [addAlert, cluster.id, clusterWizardContext, dispatch, isSingleClusterFeatureEnabled]);

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
      onNext={() => void onNext()}
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
