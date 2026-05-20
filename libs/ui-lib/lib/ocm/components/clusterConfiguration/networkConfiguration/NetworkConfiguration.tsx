import React from 'react';
import { useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import { Stack, StackItem, Tooltip } from '@patternfly/react-core';
import {
  canBeDualStack,
  CpuArchitecture,
  DUAL_STACK,
  getIPv6FromDualstack,
  HostSubnets,
  isAdvNetworkConf,
  isSNO,
  NetworkConfigurationValues,
  NO_SUBNET_SET,
  selectApiVip,
  selectIngressVip,
} from '../../../../common';
import { Address6 } from 'ip-address';
import {
  ManagedNetworkingControlGroup,
  UserManagedNetworkingTextContent,
  StackTypeControlGroup,
  AvailableSubnetsControl,
  VirtualIPControlGroup,
  VirtualIPControlGroupProps,
  AdvancedNetworkFields,
} from '../../../../common/components/clusterWizard/networkingSteps';
import { NetworkTypeDropDown } from './NetworkTypeDropdown';
import { selectCurrentClusterPermissionsState } from '../../../store/slices/current-cluster/selectors';
import { OcmCheckbox } from '../../ui/OcmFormFields';
import {
  NewFeatureSupportLevelData,
  NewFeatureSupportLevelMap,
  useNewFeatureSupportLevel,
} from '../../../../common/components/newFeatureSupportLevels';
import {
  ClusterDefaultConfig,
  PlatformType,
} from '@openshift-assisted/types/assisted-installer-service';
import useSupportLevelsAPI from '../../../hooks/useSupportLevelsAPI';
import { isOciPlatformType } from '../../utils';
import { useFeature } from '../../../hooks/use-feature';

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
  const { setFieldValue, values, validateField, validateForm } =
    useFormikContext<NetworkConfigurationValues>();

  const isSingleClusterFeature = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const isSNOCluster = isSNO(cluster);
  const isUserManagedNetworking = values.managedNetworkingType === 'userManaged';
  const isDualStack = values.stackType === DUAL_STACK;

  const isDualStackSelectable = React.useMemo(() => canBeDualStack(hostSubnets), [hostSubnets]);

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
        const primaryCidr = values.machineNetworks?.[0]?.cidr;
        const isIPv6Stack = !!primaryCidr && Address6.isValid(primaryCidr);

        let clusterNetworkDefaults;
        let serviceNetworkDefaults;

        if (isDualStack) {
          clusterNetworkDefaults = defaultNetworkSettings.clusterNetworksDualstack;

          serviceNetworkDefaults = defaultNetworkSettings.serviceNetworksDualstack;
        } else if (isIPv6Stack) {
          const ipv6EntryCluster = getIPv6FromDualstack(
            defaultNetworkSettings.clusterNetworksDualstack,
          );
          clusterNetworkDefaults = ipv6EntryCluster
            ? [ipv6EntryCluster]
            : defaultNetworkSettings.clusterNetworksIpv4;

          const ipv6EntryService = getIPv6FromDualstack(
            defaultNetworkSettings.serviceNetworksDualstack,
          );
          serviceNetworkDefaults = ipv6EntryService
            ? [ipv6EntryService]
            : defaultNetworkSettings.serviceNetworksIpv4;
        } else {
          clusterNetworkDefaults = defaultNetworkSettings.clusterNetworksIpv4;

          serviceNetworkDefaults = defaultNetworkSettings.serviceNetworksIpv4;
        }

        setFieldValue('clusterNetworks', clusterNetworkDefaults, true);
        setFieldValue('serviceNetworks', serviceNetworkDefaults, true);
      }
    },
    [
      setFieldValue,
      isDualStack,
      values.machineNetworks,
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

  React.useEffect(() => {
    if (!isSingleClusterFeature || isViewerMode || isDualStack || isAdvanced) {
      return;
    }
    const primaryCidr = values.machineNetworks?.[0]?.cidr;
    if (!primaryCidr || primaryCidr === NO_SUBNET_SET) {
      return;
    }
    const isIPv6 = Address6.isValid(primaryCidr);
    const currentClusterCidr = values.clusterNetworks?.[0]?.cidr;
    const clusterIsIPv6 = currentClusterCidr ? Address6.isValid(currentClusterCidr) : null;

    if (clusterIsIPv6 === isIPv6) {
      return;
    }

    if (isIPv6) {
      const ipv6Cluster = getIPv6FromDualstack(defaultNetworkSettings.clusterNetworksDualstack);
      if (ipv6Cluster) {
        setFieldValue('clusterNetworks', [{ ...ipv6Cluster, clusterId: cluster.id }]);
      }
      const ipv6Service = getIPv6FromDualstack(defaultNetworkSettings.serviceNetworksDualstack);
      if (ipv6Service) {
        setFieldValue('serviceNetworks', [{ cidr: ipv6Service.cidr, clusterId: cluster.id }]);
      }
    } else {
      const ipv4Cluster = defaultNetworkSettings.clusterNetworksIpv4?.[0];
      if (ipv4Cluster) {
        setFieldValue('clusterNetworks', [{ ...ipv4Cluster, clusterId: cluster.id }]);
      }
      const ipv4Service = defaultNetworkSettings.serviceNetworksIpv4?.[0];
      if (ipv4Service) {
        setFieldValue('serviceNetworks', [{ cidr: ipv4Service.cidr, clusterId: cluster.id }]);
      }
    }
    void validateForm();
  }, [
    isSingleClusterFeature,
    isViewerMode,
    isDualStack,
    isAdvanced,
    values.machineNetworks,
    values.clusterNetworks,
    defaultNetworkSettings,
    setFieldValue,
    validateForm,
    cluster.id,
  ]);

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
            defaultNetworkValues={defaultNetworkSettings}
            isViewerMode={isViewerMode}
            allowSingleStackIPv6={isSingleClusterFeature}
          />
        </StackItem>
      )}
      <StackItem>
        <NetworkTypeDropDown
          isDisabled={isViewerMode}
          featureSupportLevelData={featureSupportLevelData}
        />
      </StackItem>

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
            isViewerMode={isViewerMode}
            allowSingleStackIPv6={isSingleClusterFeature}
          />
        </StackItem>
      )}

      {!isUserManagedNetworking && (
        <StackItem>
          <VirtualIPControlGroup
            cluster={cluster}
            hostSubnets={hostSubnets}
            isVipDhcpAllocationDisabled={isVipDhcpAllocationDisabled || !isSDNSupported}
            supportLevel={featureSupportLevelContext.getFeatureSupportLevel('VIP_AUTO_ALLOC')}
            isViewerMode={isViewerMode}
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
          <AdvancedNetworkFields isDisabled={isViewerMode} />
        </StackItem>
      )}
    </Stack>
  );
};

export default NetworkConfiguration;
