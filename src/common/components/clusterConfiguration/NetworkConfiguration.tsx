import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import { Alert, AlertVariant, Checkbox, Grid } from '@patternfly/react-core';
import AdvancedNetworkFields from './AdvancedNetworkFields';
import { NetworkConfigurationValues } from '../../../common/types/clusters';
import {
  AvailableSubnetsControl,
  ManagedNetworkingControlGroup,
  UserManagedNetworkingTextContent,
  VirtualIPControlGroup,
  VirtualIPControlGroupProps,
} from '../clusterWizard/networkingSteps';
import { ClusterDefaultConfig } from '../../api';
import { isSingleNodeCluster } from '../clusters';
import { NO_SUBNET_SET } from '../../config';
import { isAdvNetworkConf } from './utils';
import { useFeatureSupportLevel } from '../featureSupportLevels';
import { getLimitedFeatureSupportLevels } from '../featureSupportLevels/utils';
import { isSNO } from '../../selectors/clusterSelectors';

export type NetworkConfigurationProps = VirtualIPControlGroupProps & {
  defaultNetworkSettings: ClusterDefaultConfig;
  hideManagedNetworking?: boolean;
};

const vmsAlert = (
  <Alert
    title="Your cluster will be subject to support limitations"
    variant={AlertVariant.info}
    isInline={true}
    data-testid="networking-vms-alert"
  >
    Some or all of your discovered hosts are virtual machines, so selecting the cluster-managed
    networking option will limit your installed cluster's support.
  </Alert>
);

const NetworkConfiguration: React.FC<NetworkConfigurationProps> = ({
  cluster,
  hostSubnets,
  isVipDhcpAllocationDisabled,
  defaultNetworkSettings,
  hideManagedNetworking,
  children,
}) => {
  const featureSupportLevelData = useFeatureSupportLevel();
  const { setFieldValue, values, touched, validateField } = useFormikContext<
    NetworkConfigurationValues
  >();
  const clusterFeatureSupportLevels = React.useMemo(() => {
    return getLimitedFeatureSupportLevels(cluster, featureSupportLevelData);
  }, [cluster, featureSupportLevelData]);
  const [isAdvanced, setAdvanced] = React.useState(
    isAdvNetworkConf(cluster, defaultNetworkSettings),
  );

  const toggleAdvConfiguration = (checked: boolean) => {
    setAdvanced(checked);

    if (!checked) {
      setFieldValue('clusterNetworkCidr', defaultNetworkSettings.clusterNetworkCidr);
      setFieldValue('serviceNetworkCidr', defaultNetworkSettings.serviceNetworkCidr);
      setFieldValue('clusterNetworkHostPrefix', defaultNetworkSettings.clusterNetworkHostPrefix);
      setFieldValue('networkType', 'OpenShiftSDN');
    }
  };

  const isMultiNodeCluster = !isSingleNodeCluster(cluster);
  const isUserManagedNetworking = values.managedNetworkingType === 'userManaged';
  const hostSubnetsCount = hostSubnets.length;
  const firstSubnet = hostSubnets[0]?.subnet;
  const isClusterManagedNetworkingWithVMsUnsupported = React.useMemo(
    () =>
      !!clusterFeatureSupportLevels &&
      clusterFeatureSupportLevels['CLUSTER_MANAGED_NETWORKING_WITH_VMS'] === 'unsupported',
    [clusterFeatureSupportLevels],
  );
  const isManagedNetworkTypeDisabled = React.useMemo(
    () =>
      !!cluster.openshiftVersion &&
      featureSupportLevelData.isFeatureDisabled(cluster.openshiftVersion, 'NETWORK_TYPE_SELECTION'),
    [cluster.openshiftVersion, featureSupportLevelData],
  );

  // Set hostSubnet to first one whenever available
  useEffect(() => {
    if (
      values.hostSubnet === NO_SUBNET_SET &&
      values.managedNetworkingType === 'clusterManaged' &&
      hostSubnetsCount
    ) {
      setFieldValue('hostSubnet', firstSubnet, false);
    }
  }, [
    firstSubnet,
    hostSubnetsCount,
    values.hostSubnet,
    setFieldValue,
    values.managedNetworkingType,
  ]);

  useEffect(() => {
    if (isUserManagedNetworking) {
      const shouldValidate = !!touched.hostSubnet;

      // We need to reset these fields' values in order to align with the values the server sends
      setFieldValue('vipDhcpAllocation', false);
      setFieldValue('ingressVip', '', shouldValidate);
      setFieldValue('apiVip', '', shouldValidate);
      if (!touched.hostSubnet || isMultiNodeCluster) {
        setFieldValue('hostSubnet', NO_SUBNET_SET, shouldValidate);
      }
    } else {
      if (!values.vipDhcpAllocation && touched.hostSubnet) {
        validateField('ingressVip');
        validateField('apiVip');
      }
    }
  }, [
    touched.hostSubnet,
    isMultiNodeCluster,
    isUserManagedNetworking,
    setFieldValue,
    values.vipDhcpAllocation,
    validateField,
  ]);

  return (
    <Grid hasGutter>
      {!hideManagedNetworking && (
        <ManagedNetworkingControlGroup disabled={isManagedNetworkTypeDisabled} />
      )}

      {isUserManagedNetworking && (
        <UserManagedNetworkingTextContent shouldDisplayLoadBalancersBullet={isMultiNodeCluster} />
      )}

      {children}

      {!isUserManagedNetworking && isClusterManagedNetworkingWithVMsUnsupported && vmsAlert}

      {!(isMultiNodeCluster && isUserManagedNetworking) && (
        <AvailableSubnetsControl
          hostSubnets={hostSubnets}
          hosts={cluster.hosts || []}
          isRequired={!isUserManagedNetworking}
          isMultiNodeCluster={isMultiNodeCluster}
        />
      )}

      {!isUserManagedNetworking && (
        <VirtualIPControlGroup
          cluster={cluster}
          hostSubnets={hostSubnets}
          isVipDhcpAllocationDisabled={isVipDhcpAllocationDisabled}
        />
      )}

      <Checkbox
        id="useAdvancedNetworking"
        label="Use advanced networking"
        description="Configure advanced networking properties (e.g. CIDR ranges)."
        isChecked={isAdvanced}
        onChange={toggleAdvConfiguration}
        body={isAdvanced && <AdvancedNetworkFields isSNO={isSNO(cluster)} />}
      />
    </Grid>
  );
};

export default NetworkConfiguration;
