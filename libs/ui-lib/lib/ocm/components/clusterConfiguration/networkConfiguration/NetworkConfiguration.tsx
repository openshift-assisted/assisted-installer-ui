import React from 'react';
import { useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import { Stack, StackItem, Tooltip } from '@patternfly/react-core';
import { VirtualIPControlGroup, VirtualIPControlGroupProps } from './VirtualIPControlGroup';
import {
  canBeDualStack,
  canSelectNetworkTypeSDN,
  clusterNetworksEqual,
  CpuArchitecture,
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
  NewFeatureSupportLevelMap,
  useNewFeatureSupportLevel,
} from '../../../../common/components/newFeatureSupportLevels';
import {
  Cluster,
  ClusterDefaultConfig,
  PlatformType,
} from '@openshift-assisted/types/assisted-installer-service';
import useSupportLevelsAPI from '../../../hooks/useSupportLevelsAPI';
import { isOciPlatformType } from '../../utils';

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

const getUserManagedDisabledReason = (
  featureSupportLevelContext: NewFeatureSupportLevelData,
  platformType?: PlatformType,
  featureSupportLevelMap?: NewFeatureSupportLevelMap | null,
) => {
  if (!featureSupportLevelContext.isFeatureSupported('USER_MANAGED_NETWORKING')) {
    return featureSupportLevelContext.getFeatureDisabledReason(
      'USER_MANAGED_NETWORKING',
      featureSupportLevelMap ?? undefined,
      undefined,
      platformType,
    );
  }
};

const getClusterManagedDisabledReason = (
  featureSupportLevelContext: NewFeatureSupportLevelData,
  featureSupportLevelMap?: NewFeatureSupportLevelMap | null,
) => {
  if (!featureSupportLevelContext.isFeatureSupported('CLUSTER_MANAGED_NETWORKING')) {
    return featureSupportLevelContext.getFeatureDisabledReason(
      'CLUSTER_MANAGED_NETWORKING',
      featureSupportLevelMap ?? undefined,
    );
  }
};

const getManagedNetworkingState = (
  isDualStack: boolean,
  isOracleCloudInfrastructure: boolean,
  featureSupportLevelData: NewFeatureSupportLevelData,
  platformType?: PlatformType,
  featureSupportLevelMap?: NewFeatureSupportLevelMap | null,
): {
  isDisabled: boolean;
  clusterManagedDisabledReason?: string;
  userManagedDisabledReason?: string;
} => {
  const networkingReason = getManagedNetworkingDisabledReason(
    isDualStack,
    isOracleCloudInfrastructure,
    featureSupportLevelData,
  );
  const cmnReason = getClusterManagedDisabledReason(
    featureSupportLevelData,
    featureSupportLevelMap,
  );
  const umnReason = getUserManagedDisabledReason(
    featureSupportLevelData,
    platformType,
    featureSupportLevelMap,
  );

  return {
    isDisabled: !!(cmnReason || umnReason || networkingReason),
    clusterManagedDisabledReason: cmnReason || networkingReason,
    userManagedDisabledReason: umnReason || networkingReason,
  };
};

const NetworkConfiguration = ({
  cluster,
  hostSubnets,
  isVipDhcpAllocationDisabled,
  defaultNetworkSettings,
}: NetworkConfigurationProps) => {
  const featureSupportLevelContext = useNewFeatureSupportLevel();
  const featureSupportLevelData = useSupportLevelsAPI(
    'features',
    cluster.openshiftVersion,
    cluster.cpuArchitecture as CpuArchitecture,
    cluster.platform?.type,
  );
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
      if (values.vipDhcpAllocation || values.ingressVips?.length || values.apiVips?.length) {
        setFieldValue('vipDhcpAllocation', false);
        setFieldValue('ingressVips', [], false);
        setFieldValue('apiVips', [], false);
      }

      if (!isSNOCluster && values.machineNetworks?.length) {
        setFieldValue('machineNetworks', [], false);
      }
    }
  }, [
    isSNOCluster,
    isUserManagedNetworking,
    values.vipDhcpAllocation,
    setFieldValue,
    validateField,
    values.apiVips,
    values.ingressVips,
    values.machineNetworks,
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
    if (!isViewerMode && isDualStack) {
      toggleAdvConfiguration(true);
    }
  }, [isDualStack, isViewerMode, toggleAdvConfiguration]);

  const managedNetworkingState = React.useMemo(
    () =>
      getManagedNetworkingState(
        isDualStack,
        isOciPlatformType(cluster),
        featureSupportLevelContext,
        cluster.platform?.type,
        featureSupportLevelData,
      ),
    [isDualStack, cluster, featureSupportLevelContext, featureSupportLevelData],
  );

  const isSDNSupported = React.useMemo(() => {
    return featureSupportLevelContext.isFeatureSupported('SDN_NETWORK_TYPE');
  }, [featureSupportLevelContext]);

  return (
    <Stack hasGutter>
      <StackItem>
        <ManagedNetworkingControlGroup
          disabled={isViewerMode || managedNetworkingState.isDisabled}
          tooltipCmnDisabled={managedNetworkingState.clusterManagedDisabledReason}
          tooltipUmnDisabled={managedNetworkingState.userManagedDisabledReason}
        />
      </StackItem>

      {isUserManagedNetworking && (
        <StackItem>
          <UserManagedNetworkingTextContent
            shouldDisplayLoadBalancersBullet={!isSNOCluster}
            docVersion={cluster.openshiftVersion}
          />
        </StackItem>
      )}

      {(isSNOCluster || !isUserManagedNetworking) && (
        <StackItem>
          <StackTypeControlGroup
            clusterId={cluster.id}
            isDualStackSelectable={isDualStackSelectable}
            hostSubnets={hostSubnets}
          />
        </StackItem>
      )}
      {isSDNSupported && (
        <StackItem>
          <NetworkTypeControlGroup isDisabled={isViewerMode} isSDNSelectable={isSDNSelectable} />
        </StackItem>
      )}

      {!(isUserManagedNetworking && !isSNOCluster) && (
        <StackItem>
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
            openshiftVersion={cluster.openshiftVersion}
          />
        </StackItem>
      )}

      {!isUserManagedNetworking && (
        <StackItem>
          <VirtualIPControlGroup
            cluster={cluster}
            isVipDhcpAllocationDisabled={isVipDhcpAllocationDisabled || !isSDNSupported}
            supportLevel={featureSupportLevelContext.getFeatureSupportLevel('VIP_AUTO_ALLOC')}
          />
        </StackItem>
      )}
      <StackItem>
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
            onChange={(_event, value) => toggleAdvConfiguration(value)}
            isDisabled={isDualStack}
          />
        </Tooltip>
      </StackItem>
      {isAdvanced && (
        <StackItem>
          <AdvancedNetworkFields />
        </StackItem>
      )}
    </Stack>
  );
};

export default NetworkConfiguration;
