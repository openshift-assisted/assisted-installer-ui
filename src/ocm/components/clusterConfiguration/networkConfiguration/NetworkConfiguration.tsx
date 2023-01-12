import React from 'react';
import { useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import { Alert, AlertVariant, Grid, Tooltip } from '@patternfly/react-core';
import { VirtualIPControlGroup, VirtualIPControlGroupProps } from './VirtualIPControlGroup';
import {
  CpuArchitecture,
  HostSubnets,
  NetworkConfigurationValues,
  Cluster,
  ClusterDefaultConfig,
  FeatureSupportLevelData,
  useFeatureSupportLevel,
  isSNO,
  canBeDualStack,
  canSelectNetworkTypeSDN,
  clusterNetworksEqual,
  DUAL_STACK,
  serviceNetworksEqual,
} from '../../../../common';
import { getLimitedFeatureSupportLevels } from '../../../../common/components/featureSupportLevels/utils';
import {
  ManagedNetworkingControlGroup,
  UserManagedNetworkingTextContent,
} from '../../../../common/components/clusterWizard/networkingSteps';
import { StackTypeControlGroup } from './StackTypeControl';
import { AvailableSubnetsControl } from './AvailableSubnetsControl';
import AdvancedNetworkFields from './AdvancedNetworkFields';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { selectCurrentClusterPermissionsState } from '../../../selectors';
import { OcmCheckbox } from '../../ui/OcmFormFields';
import { NetworkTypeControlGroup } from '../../../../common/components/clusterWizard/networkingSteps/NetworkTypeControlGroup';
import { useClusterSupportedPlatforms } from '../../../hooks';
import { TFunction } from 'i18next';

export type NetworkConfigurationProps = VirtualIPControlGroupProps & {
  hostSubnets: HostSubnets;
  defaultNetworkSettings: Pick<
    ClusterDefaultConfig,
    | 'clusterNetworksIpv4'
    | 'clusterNetworksDualstack'
    | 'serviceNetworksIpv4'
    | 'serviceNetworksDualstack'
  >;
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

const isManagedNetworkingDisabled = (
  isDualStack: boolean,
  openshiftVersion: Cluster['openshiftVersion'],
  cpuArchitecture: Cluster['cpuArchitecture'],
  featureSupportLevelData: FeatureSupportLevelData,
) => {
  if (isDualStack) {
    return {
      isNetworkManagementDisabled: true,
      networkManagementDisabledReason:
        'Network management selection is not supported with dual-stack',
    };
  } else if (
    openshiftVersion &&
    cpuArchitecture === CpuArchitecture.ARM &&
    !featureSupportLevelData.isFeatureSupported(
      openshiftVersion,
      'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING',
    )
  ) {
    return {
      isNetworkManagementDisabled: true,
      networkManagementDisabledReason: featureSupportLevelData.getFeatureDisabledReason(
        openshiftVersion,
        'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING',
      ),
    };
  } else if (
    !!openshiftVersion &&
    featureSupportLevelData.isFeatureDisabled(openshiftVersion, 'NETWORK_TYPE_SELECTION')
  ) {
    return {
      isNetworkManagementDisabled: true,
      networkManagementDisabledReason: featureSupportLevelData.getFeatureDisabledReason(
        openshiftVersion,
        'NETWORK_TYPE_SELECTION',
      ),
    };
  } else {
    return { isNetworkManagementDisabled: false, networkManagementDisabledReason: undefined };
  }
};

const isUserManagedNetworkingDisabled = (
  isSupportedPlatformIntegrationNutanix: boolean,
  t: TFunction,
) => {
  if (isSupportedPlatformIntegrationNutanix) {
    return {
      isUserManagementDisabled: isSupportedPlatformIntegrationNutanix,
      userManagementDisabledReason: t(
        'ai:User-Managed Networking is not supported when using Nutanix',
      ),
    };
  } else {
    return {
      isUserManagementDisabled: false,
      userManagementDisabledReason: '',
    };
  }
};

const NetworkConfiguration = ({
  cluster,
  hostSubnets,
  isVipDhcpAllocationDisabled,
  defaultNetworkSettings,
  hideManagedNetworking,
}: NetworkConfigurationProps) => {
  const { t } = useTranslation();
  const featureSupportLevelData = useFeatureSupportLevel();
  const { setFieldValue, values, validateField } = useFormikContext<NetworkConfigurationValues>();

  const clusterFeatureSupportLevels = React.useMemo(() => {
    return getLimitedFeatureSupportLevels(cluster, featureSupportLevelData, t);
  }, [cluster, featureSupportLevelData, t]);
  const isSNOCluster = isSNO(cluster);
  const isMultiNodeCluster = !isSNOCluster;
  const isUserManagedNetworking = values.managedNetworkingType === 'userManaged';
  const isDualStack = values.stackType === DUAL_STACK;
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const shouldUpdateAdvConf = !isViewerMode && isDualStack && !isUserManagedNetworking;
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
      setFieldValue('ingressVip', '', false);
      setFieldValue('apiVip', '', false);

      if (isMultiNodeCluster) {
        setFieldValue('machineNetworks', [], false);
      }
    }
  }, [
    isMultiNodeCluster,
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
    if (shouldUpdateAdvConf) {
      toggleAdvConfiguration(true);
    }
  }, [shouldUpdateAdvConf, toggleAdvConfiguration]);

  const { supportedPlatformIntegration } = useClusterSupportedPlatforms(cluster.id);
  const isSupportedPlatformIntegrationNutanix = supportedPlatformIntegration === 'nutanix';
  const { isNetworkManagementDisabled, networkManagementDisabledReason } = React.useMemo(
    () =>
      isManagedNetworkingDisabled(
        isDualStack,
        cluster.openshiftVersion,
        cluster.cpuArchitecture,
        featureSupportLevelData,
      ),
    [cluster.cpuArchitecture, cluster.openshiftVersion, featureSupportLevelData, isDualStack],
  );

  const { isUserManagementDisabled, userManagementDisabledReason } = React.useMemo(
    () => isUserManagedNetworkingDisabled(isSupportedPlatformIntegrationNutanix, t),
    [isSupportedPlatformIntegrationNutanix, t],
  );

  return (
    <Grid hasGutter>
      {!hideManagedNetworking && (
        <ManagedNetworkingControlGroup
          disabled={isViewerMode || isNetworkManagementDisabled || isUserManagementDisabled}
          tooltip={networkManagementDisabledReason}
          tooltipUmnDisabled={userManagementDisabledReason}
        />
      )}

      {isUserManagedNetworking && (
        <UserManagedNetworkingTextContent shouldDisplayLoadBalancersBullet={isMultiNodeCluster} />
      )}

      {!isUserManagedNetworking &&
        !!clusterFeatureSupportLevels &&
        clusterFeatureSupportLevels['CLUSTER_MANAGED_NETWORKING_WITH_VMS'] === 'unsupported' &&
        vmsAlert}

      {(isSNOCluster || !isUserManagedNetworking) && (
        <StackTypeControlGroup
          clusterId={cluster.id}
          isDualStackSelectable={isDualStackSelectable}
          hostSubnets={hostSubnets}
        />
      )}
      <NetworkTypeControlGroup isDisabled={isViewerMode} isSDNSelectable={isSDNSelectable} />

      {!(isUserManagedNetworking && isMultiNodeCluster) && (
        <AvailableSubnetsControl
          clusterId={cluster.id}
          hostSubnets={hostSubnets}
          isRequired={!isUserManagedNetworking}
          isDisabled={
            (cluster.vipDhcpAllocation &&
              cluster.apiVip === undefined &&
              cluster.ingressVip === undefined) ||
            false
          }
        />
      )}

      {!isUserManagedNetworking && (
        <VirtualIPControlGroup
          cluster={cluster}
          isVipDhcpAllocationDisabled={isVipDhcpAllocationDisabled}
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
