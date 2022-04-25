import React, { useCallback, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { Alert, AlertVariant, Checkbox, Grid, Tooltip } from '@patternfly/react-core';
import { VirtualIPControlGroup, VirtualIPControlGroupProps } from './VirtualIPControlGroup';
import { Cluster } from '../../../../common/api/types';
import { useFeatureSupportLevel } from '../../../../common/components/featureSupportLevels';
import { NetworkConfigurationValues } from '../../../../common/types';
import { getLimitedFeatureSupportLevels } from '../../../../common/components/featureSupportLevels/utils';
import { useFeature } from '../../../../common/features';
import {
  allHostSubnetsIPv4,
  canSelectNetworkTypeSDN,
  getDefaultNetworkType,
  isSNO,
} from '../../../../common/selectors';
import {
  ManagedNetworkingControlGroup,
  UserManagedNetworkingTextContent,
} from '../../../../common/components/clusterWizard/networkingSteps';
import { StackTypeControlGroup } from './StackTypeControl';
import { AvailableSubnetsControl } from './AvailableSubnetsControl';
import AdvancedNetworkFields from './AdvancedNetworkFields';
import {
  clusterNetworksEqual,
  DUAL_STACK,
  NETWORK_TYPE_OVN,
  serviceNetworksEqual,
} from '../../../../common';

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

const isAdvNetworkConf = (
  cluster: Cluster,
  defaultNetworkValues: Pick<NetworkConfigurationValues, 'serviceNetworks' | 'clusterNetworks'>,
  defaultNetworkType: string,
) =>
  !(
    !!cluster.networkType &&
    cluster.networkType === defaultNetworkType &&
    serviceNetworksEqual(
      cluster.serviceNetworks || [],
      defaultNetworkValues.serviceNetworks || [],
    ) &&
    clusterNetworksEqual(cluster.clusterNetworks || [], defaultNetworkValues.clusterNetworks || [])
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
  const isDualStack = values.stackType === DUAL_STACK;

  const isDualStackSelectable = React.useMemo(() => !allHostSubnetsIPv4(hostSubnets), [
    hostSubnets,
  ]);

  const { defaultNetworkType, isSDNSelectable } = React.useMemo(() => {
    return {
      defaultNetworkType: getDefaultNetworkType(!isMultiNodeCluster, isDualStack),
      isSDNSelectable: canSelectNetworkTypeSDN(!isMultiNodeCluster, isDualStack),
    };
  }, [isMultiNodeCluster, isDualStack]);

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
        setFieldValue('machineNetworks', [], false);
      }
    } else {
      if (!values.vipDhcpAllocation) {
        validateField('ingressVip');
        validateField('apiVip');
      }
    }
  }, [
    isMultiNodeCluster,
    isUserManagedNetworking,
    values.vipDhcpAllocation,
    setFieldValue,
    validateField,
  ]);

  const toggleAdvConfiguration = useCallback(
    (checked: boolean) => {
      setAdvanced(checked);

      if (!checked) {
        setFieldValue('clusterNetworks', defaultNetworkSettings.clusterNetworks, true);
        setFieldValue('serviceNetworks', defaultNetworkSettings.serviceNetworks, true);
        setFieldValue('networkType', getDefaultNetworkType(!isMultiNodeCluster, isDualStack));
      }
    },
    [
      setFieldValue,
      defaultNetworkSettings.clusterNetworks,
      defaultNetworkSettings.serviceNetworks,
      isMultiNodeCluster,
      isDualStack,
    ],
  );

  useEffect(() => {
    if (isDualStack && !isUserManagedNetworking) {
      toggleAdvConfiguration(true);
    }
  }, [toggleAdvConfiguration, isUserManagedNetworking, isDualStack]);

  useEffect(() => {
    if (isNetworkTypeSelectionEnabled && !isSDNSelectable) {
      setFieldValue('vipDhcpAllocation', false);
      setFieldValue('networkType', NETWORK_TYPE_OVN);
      toggleAdvConfiguration(true);
    }
  }, [isNetworkTypeSelectionEnabled, isSDNSelectable, setFieldValue, toggleAdvConfiguration]);

  return (
    <Grid hasGutter>
      {!hideManagedNetworking && (
        <ManagedNetworkingControlGroup
          disabled={
            isDualStack ||
            (!!cluster.openshiftVersion &&
              featureSupportLevelData.isFeatureDisabled(
                cluster.openshiftVersion,
                'NETWORK_TYPE_SELECTION',
              ))
          }
          tooltip={
            isDualStack ? 'User-Managed networking is not supported with dual-stack' : undefined
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

      {!isUserManagedNetworking && (
        <StackTypeControlGroup
          clusterId={cluster.id}
          isDualStackSelectable={isDualStackSelectable}
        />
      )}

      {!(isUserManagedNetworking && isMultiNodeCluster) && (
        <AvailableSubnetsControl
          clusterId={cluster.id}
          hostSubnets={hostSubnets}
          isRequired={!isUserManagedNetworking}
        />
      )}

      {!isUserManagedNetworking && (
        <VirtualIPControlGroup
          cluster={cluster}
          hostSubnets={hostSubnets}
          isVipDhcpAllocationDisabled={isVipDhcpAllocationDisabled}
        />
      )}

      <Tooltip
        content={'Advanced networking properties must be configured in dual-stack'}
        hidden={!isDualStack}
        position={'top-start'}
      >
        <Checkbox
          id="useAdvancedNetworking"
          label="Use advanced networking"
          description="Configure advanced networking properties (e.g. CIDR ranges)."
          isChecked={isAdvanced}
          onChange={toggleAdvConfiguration}
          isDisabled={isDualStack}
        />
      </Tooltip>

      {isAdvanced && <AdvancedNetworkFields isSDNSelectable={isSDNSelectable} />}
    </Grid>
  );
};

export default NetworkConfiguration;
