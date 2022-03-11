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

  const updateNetworkConfig = (vipDhcpAllocation: boolean) => {
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
      setFieldValue('vipDhcpAllocation', vipDhcpAllocation);

      if (!vipDhcpAllocation && touched.hostSubnet) {
        validateField('ingressVip');
        validateField('apiVip');
      }
    }
  };

  useEffect(
    () => {
      const currentDhcpAllocation = values.vipDhcpAllocation || false;
      if (values.preferredVipDhcpAllocation !== undefined) {
        setFieldValue('preferredVipDhcpAllocation', currentDhcpAllocation);
        updateNetworkConfig(values.preferredVipDhcpAllocation);
      } else {
        updateNetworkConfig(currentDhcpAllocation);
      }
    },
    // To be able to remember previous dhcp allocation
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [touched.hostSubnet, isMultiNodeCluster, isUserManagedNetworking, setFieldValue, validateField],
  );

  useEffect(
    () => {
      updateNetworkConfig(values.vipDhcpAllocation || false);
    },
    // To be able to remember previous dhcp allocation
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values.vipDhcpAllocation],
  );

  return (
    <Grid hasGutter>
      {!hideManagedNetworking && (
        <ManagedNetworkingControlGroup
          disabled={
            !!cluster.openshiftVersion &&
            featureSupportLevelData.isFeatureDisabled(
              cluster.openshiftVersion,
              'NETWORK_TYPE_SELECTION',
            )
          }
        />
      )}

      {isUserManagedNetworking && (
        <UserManagedNetworkingTextContent shouldDisplayLoadBalancersBullet={isMultiNodeCluster} />
      )}

      {children}

      {!isUserManagedNetworking &&
        !!clusterFeatureSupportLevels &&
        clusterFeatureSupportLevels['CLUSTER_MANAGED_NETWORKING_WITH_VMS'] === 'unsupported' &&
        vmsAlert}

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
        body={isAdvanced && <AdvancedNetworkFields />}
      />
    </Grid>
  );
};

export default NetworkConfiguration;
