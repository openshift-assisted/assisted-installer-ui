import React from 'react';
import { useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import { Grid, Tooltip } from '@patternfly/react-core';
import { VirtualIPControlGroup, VirtualIPControlGroupProps } from './VirtualIPControlGroup';
import {
  canBeDualStack,
  canSelectNetworkTypeSDN,
  clusterNetworksEqual,
  DUAL_STACK,
  HostSubnets,
  isSNO,
  NetworkConfigurationValues,
  selectApiVip,
  selectIngressVip,
  serviceNetworksEqual,
} from '../../../../common';
import {
  ManagedNetworkingControlGroup,
  UserManagedNetworkingTextContent,
} from '../../../../common/components/clusterWizard/networkingSteps';
import { StackTypeControlGroup } from './StackTypeControl';
import { AvailableSubnetsControl } from './AvailableSubnetsControl';
import AdvancedNetworkFields from './AdvancedNetworkFields';
import { selectCurrentClusterPermissionsState } from '../../../store/slices/current-cluster/selectors';
import { OcmCheckbox } from '../../ui/OcmFormFields';
import { NetworkTypeControlGroup } from '../../../../common/components/clusterWizard/networkingSteps/NetworkTypeControlGroup';
import {
  NewFeatureSupportLevelData,
  useNewFeatureSupportLevel,
} from '../../../../common/components/newFeatureSupportLevels';
import {
  Cluster,
  ClusterDefaultConfig,
} from '@openshift-assisted/types/assisted-installer-service';

export type NetworkConfigurationProps = VirtualIPControlGroupProps & {
  hostSubnets: HostSubnets;
  defaultNetworkSettings: Pick<
    ClusterDefaultConfig,
    | 'clusterNetworksIpv4'
    | 'clusterNetworksDualstack'
    | 'serviceNetworksIpv4'
    | 'serviceNetworksDualstack'
  >;
};

const isAdvNetworkConf = (
  cluster: Cluster,
  defaultNetworkValues: Pick<ClusterDefaultConfig, 'clusterNetworksIpv4' | 'serviceNetworksIpv4'>,
) =>
  !(
    serviceNetworksEqual(
      cluster.serviceNetworks || [],
      defaultNetworkValues.serviceNetworksIpv4 || [],
    ) &&
    clusterNetworksEqual(
      cluster.clusterNetworks || [],
      defaultNetworkValues.clusterNetworksIpv4 || [],
    )
  );

const getManagedNetworkingDisabledReason = (
  isDualStack: boolean,
  isOracleCloudInfrastructure: boolean,
  featureSupportLevelData: NewFeatureSupportLevelData,
) => {
  if (isOracleCloudInfrastructure) {
    return 'Network management selection is not supported with Oracle Cloud Infrastructure';
  } else if (isDualStack) {
    return 'Network management selection is not supported with dual-stack';
  } else if (featureSupportLevelData.isFeatureDisabled('NETWORK_TYPE_SELECTION')) {
    return featureSupportLevelData.getFeatureDisabledReason('NETWORK_TYPE_SELECTION');
  }
};

const getPlatformManagedNetworkingDisabledReason = (
  featureSupportLevelData: NewFeatureSupportLevelData,
  platformType: string,
) => {
  if (!featureSupportLevelData.isFeatureSupported('PLATFORM_MANAGED_NETWORKING')) {
    return featureSupportLevelData.getFeatureDisabledReason(
      'PLATFORM_MANAGED_NETWORKING',
      undefined,
      undefined,
      platformType,
    );
  }
};

const getManagedNetworkingState = (
  isDualStack: boolean,
  featureSupportLevelData: NewFeatureSupportLevelData,
  platformType: string,
): {
  isDisabled: boolean;
  clusterManagedDisabledReason?: string;
  userManagedDisabledReason?: string;
} => {
  const isOracleCloudInfrastructure = platformType === 'oci';
  const networkingReason = getManagedNetworkingDisabledReason(
    isDualStack,
    isOracleCloudInfrastructure,
    featureSupportLevelData,
  );
  const platformReason = getPlatformManagedNetworkingDisabledReason(
    featureSupportLevelData,
    platformType,
  );

  return {
    isDisabled: !!(platformReason || networkingReason),
    clusterManagedDisabledReason: networkingReason,
    userManagedDisabledReason: platformReason || networkingReason,
  };
};

const NetworkConfiguration = ({
  cluster,
  hostSubnets,
  isVipDhcpAllocationDisabled,
  defaultNetworkSettings,
}: NetworkConfigurationProps) => {
  const featureSupportLevelData = useNewFeatureSupportLevel();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const { setFieldValue, values, validateField } = useFormikContext<NetworkConfigurationValues>();

  const isSNOCluster = isSNO(cluster);
  const isUserManagedNetworking = values.managedNetworkingType === 'userManaged';
  const isDualStack = values.stackType === DUAL_STACK;

  const isDualStackSelectable = React.useMemo(() => canBeDualStack(hostSubnets), [hostSubnets]);
  const isSDNSelectable = React.useMemo(() => {
    return canSelectNetworkTypeSDN(isSNOCluster, isDualStack);
  }, [isSNOCluster, isDualStack]);

  const [isAdvanced, setAdvanced] = React.useState(
    isDualStack || isAdvNetworkConf(cluster, defaultNetworkSettings),
  );

  React.useEffect(() => {
    if (isUserManagedNetworking) {
      // We need to reset these fields' values in order to align with the values the server sends
      setFieldValue('vipDhcpAllocation', false);
      setFieldValue('ingressVips', [], false);
      setFieldValue('apiVips', [], false);

      if (!isSNOCluster) {
        setFieldValue('machineNetworks', [], false);
      }
    }
  }, [
    isSNOCluster,
    isUserManagedNetworking,
    values.vipDhcpAllocation,
    setFieldValue,
    validateField,
  ]);

  const toggleAdvConfiguration = React.useCallback(
    (checked: boolean) => {
      setAdvanced(checked);

      if (!checked) {
        setFieldValue(
          'clusterNetworks',
          isDualStack
            ? defaultNetworkSettings.clusterNetworksDualstack
            : defaultNetworkSettings.clusterNetworksIpv4,
          true,
        );
        setFieldValue(
          'serviceNetworks',
          isDualStack
            ? defaultNetworkSettings.serviceNetworksDualstack
            : defaultNetworkSettings.serviceNetworksIpv4,
          true,
        );
      }
    },
    [
      setFieldValue,
      isDualStack,
      defaultNetworkSettings.clusterNetworksDualstack,
      defaultNetworkSettings.clusterNetworksIpv4,
      defaultNetworkSettings.serviceNetworksDualstack,
      defaultNetworkSettings.serviceNetworksIpv4,
    ],
  );

  React.useEffect(() => {
    if (!isViewerMode && isDualStack && !isUserManagedNetworking) {
      toggleAdvConfiguration(true);
    }
  }, [isDualStack, isUserManagedNetworking, isViewerMode, toggleAdvConfiguration]);

  const managedNetworkingState = React.useMemo(
    () =>
      getManagedNetworkingState(isDualStack, featureSupportLevelData, cluster.platform?.type || ''),
    [isDualStack, cluster.platform?.type, featureSupportLevelData],
  );

  return (
    <Grid hasGutter>
      <ManagedNetworkingControlGroup
        disabled={isViewerMode || managedNetworkingState.isDisabled}
        tooltipCmnDisabled={managedNetworkingState.clusterManagedDisabledReason}
        tooltipUmnDisabled={managedNetworkingState.userManagedDisabledReason}
      />

      {isUserManagedNetworking && (
        <UserManagedNetworkingTextContent
          shouldDisplayLoadBalancersBullet={!isSNOCluster}
          docVersion={cluster.openshiftVersion}
        />
      )}

      {(isSNOCluster || !isUserManagedNetworking) && (
        <StackTypeControlGroup
          clusterId={cluster.id}
          isDualStackSelectable={isDualStackSelectable}
          hostSubnets={hostSubnets}
        />
      )}
      <NetworkTypeControlGroup isDisabled={isViewerMode} isSDNSelectable={isSDNSelectable} />

      {!(isUserManagedNetworking && !isSNOCluster) && (
        <AvailableSubnetsControl
          clusterId={cluster.id}
          hostSubnets={hostSubnets}
          isRequired={!isUserManagedNetworking}
          isDisabled={
            (cluster.vipDhcpAllocation &&
              selectApiVip(cluster) === '' &&
              selectIngressVip(cluster) === '') ||
            hostSubnets.length === 0 ||
            false
          }
        />
      )}

      {!isUserManagedNetworking && (
        <VirtualIPControlGroup
          cluster={cluster}
          isVipDhcpAllocationDisabled={isVipDhcpAllocationDisabled}
          supportLevel={featureSupportLevelData.getFeatureSupportLevel('VIP_AUTO_ALLOC')}
        />
      )}

      <Tooltip
        content={'Advanced networking properties must be configured in dual-stack'}
        hidden={!isDualStack}
        position={'top-start'}
      >
        <OcmCheckbox
          id="useAdvancedNetworking"
          label="Use advanced networking"
          description="Configure advanced networking properties (e.g. CIDR ranges)."
          isChecked={isAdvanced}
          onChange={toggleAdvConfiguration}
          isDisabled={isDualStack}
        />
      </Tooltip>

      {isAdvanced && <AdvancedNetworkFields />}
    </Grid>
  );
};

export default NetworkConfiguration;
