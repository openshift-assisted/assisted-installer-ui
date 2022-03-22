import React, { useCallback, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { Alert, AlertVariant, Checkbox, Grid, Tooltip } from '@patternfly/react-core';
import { VirtualIPControlGroup, VirtualIPControlGroupProps } from './VirtualIPControlGroup';
import { Cluster } from '../../../../common/api/types';
import { useFeatureSupportLevel } from '../../../../common/components/featureSupportLevels';
import { NetworkConfigurationValues } from '../../../../common/types';
import { getLimitedFeatureSupportLevels } from '../../../../common/components/featureSupportLevels/utils';
import { useFeature } from '../../../../common/features';
import { isAdvNetworkConf } from '../../../../common/components/clusterConfiguration';
import {
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
import { allSubnetsIPv4, NETWORK_TYPE_OVN } from '../../../../common';

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
  const isDualStack = values.stackType === 'dualStack';

  const { usesIPv6, defaultNetworkType, isSDNSelectable } = React.useMemo(() => {
    const usesIPv6 = !(
      allSubnetsIPv4(values.machineNetworks) &&
      allSubnetsIPv4(values.clusterNetworks) &&
      allSubnetsIPv4(values.serviceNetworks)
    );
    return {
      usesIPv6,
      defaultNetworkType: getDefaultNetworkType(!isMultiNodeCluster, usesIPv6),
      isSDNSelectable: canSelectNetworkTypeSDN(!isMultiNodeCluster, usesIPv6),
    };
  }, [values.clusterNetworks, values.machineNetworks, values.serviceNetworks, isMultiNodeCluster]);

  const [isAdvanced, setAdvanced] = React.useState(
    isAdvNetworkConf(cluster, defaultNetworkSettings, defaultNetworkType) ||
      values.stackType === 'dualStack',
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
        setFieldValue('clusterNetworks', defaultNetworkSettings.clusterNetworks, false);
        setFieldValue('serviceNetworks', defaultNetworkSettings.serviceNetworks, false);
        setFieldValue('networkType', getDefaultNetworkType(!isMultiNodeCluster, usesIPv6));
      }
    },
    [
      setFieldValue,
      defaultNetworkSettings.clusterNetworks,
      defaultNetworkSettings.serviceNetworks,
      isMultiNodeCluster,
      usesIPv6,
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

      {!isUserManagedNetworking && <StackTypeControlGroup clusterId={cluster.id} />}

      {!(isUserManagedNetworking && isMultiNodeCluster) && (
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

      <Tooltip
        content={'Advanced networking properties must be configured in dual-stack'}
        hidden={values.stackType === 'singleStack'}
        position={'top-start'}
      >
        <Checkbox
          id="useAdvancedNetworking"
          label="Use advanced networking"
          description="Configure advanced networking properties (e.g. CIDR ranges)."
          isChecked={isAdvanced}
          onChange={toggleAdvConfiguration}
          isDisabled={values.stackType === 'dualStack'}
        />
      </Tooltip>

      {isAdvanced && <AdvancedNetworkFields isSDNSelectable={isSDNSelectable} />}
    </Grid>
  );
};

export default NetworkConfiguration;
