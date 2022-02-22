import React, { useCallback, useEffect, useMemo } from 'react';
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
  StackTypeControlGroup,
} from '../clusterWizard/networkingSteps';
import { NETWORK_TYPE_OVN, NO_SUBNET_SET } from '../../config';
import { isAdvNetworkConf } from './utils';
import { useFeatureSupportLevel } from '../featureSupportLevels';
import { getLimitedFeatureSupportLevels } from '../featureSupportLevels/utils';
import {
  canSelectNetworkTypeSDN,
  getDefaultNetworkType,
  isSNO,
  isSubnetInIPv6,
} from '../../selectors';
import { Address6, Address4 } from 'ip-address';
import { Cluster } from '../../api';
import { useFeature } from '../../features';

export type NetworkConfigurationProps = VirtualIPControlGroupProps & {
  defaultNetworkSettings: Partial<Cluster>;
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
  const { setFieldValue, values, validateField } = useFormikContext<NetworkConfigurationValues>();

  const clusterFeatureSupportLevels = React.useMemo(() => {
    return getLimitedFeatureSupportLevels(cluster, featureSupportLevelData);
  }, [cluster, featureSupportLevelData]);

  const isNetworkTypeSelectionEnabled = useFeature(
    'ASSISTED_INSTALLER_NETWORK_TYPE_SELECTION_FEATURE',
  );

  const isMultiNodeCluster = !isSNO(cluster);
  const isUserManagedNetworking = values.managedNetworkingType === 'userManaged';
  const isClusterCIDRIPv6 = Address6.isValid(values.clusterNetworkCidr || '');
  const isDualStack = values.stackType === 'dualStack';

  const { isIPv6, defaultNetworkType, isSDNSelectable } = React.useMemo(() => {
    const isIPv6 = isSubnetInIPv6({
      machineNetworkCidr: cluster.machineNetworkCidr,
      clusterNetworkCidr: values.clusterNetworkCidr,
      serviceNetworkCidr: values.serviceNetworkCidr,
    });
    return {
      isIPv6,
      defaultNetworkType: getDefaultNetworkType(!isMultiNodeCluster, isIPv6),
      isSDNSelectable: canSelectNetworkTypeSDN(!isMultiNodeCluster, isIPv6),
    };
  }, [
    isMultiNodeCluster,
    values.clusterNetworkCidr,
    cluster.machineNetworkCidr,
    values.serviceNetworkCidr,
  ]);

  const [isAdvanced, setAdvanced] = React.useState(
    isAdvNetworkConf(cluster, defaultNetworkSettings, defaultNetworkType) || isDualStack,
  );

  useEffect(() => {
    if (isUserManagedNetworking) {
      // We need to reset these fields' values in order to align with the values the server sends
      setFieldValue('vipDhcpAllocation', false);
      setFieldValue('ingressVip', '', false);
      setFieldValue('apiVip', '', false);

      if (isMultiNodeCluster) {
        setFieldValue(
          'machineNetworks',
          cluster.machineNetworks?.length
            ? cluster.machineNetworks
            : [{ cidr: NO_SUBNET_SET, clusterId: cluster.id }],
          false,
        );
      }
    } else {
      if (!values.vipDhcpAllocation) {
        validateField('ingressVip');
        validateField('apiVip');
      }
    }
  }, [
    cluster.id,
    cluster.machineNetworks,
    values.vipDhcpAllocation,
    isMultiNodeCluster,
    isUserManagedNetworking,
    setFieldValue,
    validateField,
  ]);

  useEffect(() => {
    if (!cluster.networkType) {
      setFieldValue('networkType', getDefaultNetworkType(!isMultiNodeCluster, isIPv6));
    } else if (!isSDNSelectable) {
      setFieldValue('networkType', NETWORK_TYPE_OVN);
    }
    // Skipping "cluster.networkType" as it's ultimately the value we are setting in the form
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIPv6, isMultiNodeCluster, setFieldValue]);

  const toggleAdvConfiguration = useCallback(
    (checked: boolean) => {
      setAdvanced(checked);

      if (!checked) {
        setFieldValue('clusterNetworks', defaultNetworkSettings.clusterNetworks, false);
        setFieldValue('serviceNetworks', defaultNetworkSettings.serviceNetworks, false);
        setFieldValue('networkType', 'OpenshiftSDN');
      }
    },
    [setFieldValue, setAdvanced, defaultNetworkSettings],
  );

  useEffect(() => {
    if (values.stackType === 'dualStack' && !isUserManagedNetworking) {
      toggleAdvConfiguration(true);
    }
  }, [values.stackType, toggleAdvConfiguration, isUserManagedNetworking]);

  const enableSDN = useMemo(
    () =>
      values.machineNetworks?.every((network) => network.cidr && Address4.isValid(network.cidr)) &&
      values.clusterNetworks?.every((network) => network.cidr && Address4.isValid(network.cidr)) &&
      values.serviceNetworks?.every((network) => network.cidr && Address4.isValid(network.cidr)),
    [values],
  );

  useEffect(() => {
    if (isNetworkTypeSelectionEnabled && !enableSDN) {
      setFieldValue('vipDhcpAllocation', false);
      setFieldValue('networkType', 'OVNKubernetes');
    }
  }, [isNetworkTypeSelectionEnabled, enableSDN, setFieldValue]);

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
        <StackTypeControlGroup clusterId={cluster.id} />
      )}

      {!(isMultiNodeCluster && isUserManagedNetworking) && (
        <AvailableSubnetsControl
          clusterId={cluster.id}
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
      />

      {isAdvanced && (
        <AdvancedNetworkFields
          isSDNSelectable={isSDNSelectable}
          isClusterCIDRIPv6={isClusterCIDRIPv6}
          clusterId={cluster.id}
        />
      )}
    </Grid>
  );
};

export default NetworkConfiguration;
