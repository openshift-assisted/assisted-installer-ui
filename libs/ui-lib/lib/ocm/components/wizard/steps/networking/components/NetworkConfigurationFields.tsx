import React from 'react';
import { useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import { Address6 } from 'ip-address';
import { Stack, StackItem, Tooltip } from '@patternfly/react-core';
import { ClusterDefaultConfig } from '@openshift-assisted/types/assisted-installer-service';
import {
  canBeDualStack,
  CpuArchitecture,
  DUAL_STACK,
  HostSubnets,
  isAdvNetworkConf,
  isSNO,
  NetworkConfigurationValues,
  NO_SUBNET_SET,
  selectApiVip,
  selectIngressVip,
  ManagedNetworkingControlGroup,
  UserManagedNetworkingTextContent,
  StackTypeControlGroup,
  AvailableSubnetsControl,
  VirtualIPControlGroup,
  VirtualIPControlGroupProps,
  AdvancedNetworkFields,
  useNewFeatureSupportLevel,
} from '../../../../../../common';
import { selectCurrentClusterPermissionsState } from '../../../../../store';
import { useFeature, useSupportLevelsAPI } from '../../../../../hooks';
import { OcmCheckbox } from '../../../../ui';
import { isOciPlatformType } from '../../../../utils';
import { NetworkTypeDropDown } from './NetworkTypeDropdown';
import { getManagedNetworkingState, getNetworkDefaultsByFamily } from './utils';

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

export const NetworkConfigurationFields = ({
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
        const { clusterNetworkDefaults, serviceNetworkDefaults } = getNetworkDefaultsByFamily(
          defaultNetworkSettings,
          isDualStack,
          isIPv6Stack,
        );
        setFieldValue('clusterNetworks', clusterNetworkDefaults, true);
        setFieldValue('serviceNetworks', serviceNetworkDefaults, true);
      }
    },
    [setFieldValue, isDualStack, values.machineNetworks, defaultNetworkSettings],
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

    const { clusterNetworkDefaults, serviceNetworkDefaults } = getNetworkDefaultsByFamily(
      defaultNetworkSettings,
      false,
      isIPv6,
    );
    if (clusterNetworkDefaults) {
      setFieldValue('clusterNetworks', clusterNetworkDefaults);
    }
    if (serviceNetworkDefaults) {
      setFieldValue('serviceNetworks', serviceNetworkDefaults);
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
