import React, { useCallback, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { Alert, AlertVariant, Checkbox, Grid, Tooltip } from '@patternfly/react-core';
import { VirtualIPControlGroup, VirtualIPControlGroupProps } from './VirtualIPControlGroup';
import { Cluster, ClusterDefaultConfig } from '../../../../common/api/types';
import {
  FeatureSupportLevelData,
  useFeatureSupportLevel,
} from '../../../../common/components/featureSupportLevels';
import { CpuArchitecture, NetworkConfigurationValues } from '../../../../common/types';
import { getLimitedFeatureSupportLevels } from '../../../../common/components/featureSupportLevels/utils';
import { isSNO } from '../../../../common/selectors';
import {
  canBeDualStack,
  canSelectNetworkTypeSDN,
  getDefaultNetworkType,
  clusterNetworksEqual,
  DUAL_STACK,
  serviceNetworksEqual,
} from '../../../../common';
import {
  ManagedNetworkingControlGroup,
  UserManagedNetworkingTextContent,
} from '../../../../common/components/clusterWizard/networkingSteps';
import { StackTypeControlGroup } from './StackTypeControl';
import { AvailableSubnetsControl } from './AvailableSubnetsControl';
import AdvancedNetworkFields from './AdvancedNetworkFields';

export type NetworkConfigurationProps = VirtualIPControlGroupProps & {
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
  defaultNetworkType: string,
) =>
  !(
    !!cluster.networkType &&
    cluster.networkType === defaultNetworkType &&
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
  const isSNOCluster = isSNO(cluster);
  const isMultiNodeCluster = !isSNOCluster;
  const isUserManagedNetworking = values.managedNetworkingType === 'userManaged';
  const isDualStack = values.stackType === DUAL_STACK;

  const isDualStackSelectable = React.useMemo(() => canBeDualStack(hostSubnets), [hostSubnets]);

  const { defaultNetworkType, isSDNSelectable } = React.useMemo(() => {
    return {
      defaultNetworkType: getDefaultNetworkType(isSNOCluster, isDualStack),
      isSDNSelectable: canSelectNetworkTypeSDN(isSNOCluster, isDualStack),
    };
  }, [isSNOCluster, isDualStack]);

  const [isAdvanced, setAdvanced] = React.useState(
    isDualStack || isAdvNetworkConf(cluster, defaultNetworkSettings, defaultNetworkType),
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
        setFieldValue('networkType', getDefaultNetworkType(isSNOCluster, isDualStack));
      }
    },
    [
      setFieldValue,
      isDualStack,
      isSNOCluster,
      defaultNetworkSettings.clusterNetworksDualstack,
      defaultNetworkSettings.clusterNetworksIpv4,
      defaultNetworkSettings.serviceNetworksDualstack,
      defaultNetworkSettings.serviceNetworksIpv4,
    ],
  );

  useEffect(() => {
    if (isDualStack && !isUserManagedNetworking) {
      toggleAdvConfiguration(true);
    }
  }, [toggleAdvConfiguration, isUserManagedNetworking, isDualStack]);

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

  return (
    <Grid hasGutter>
      {!hideManagedNetworking && (
        <ManagedNetworkingControlGroup
          disabled={isNetworkManagementDisabled}
          tooltip={networkManagementDisabledReason}
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

      {(isSNOCluster || !isUserManagedNetworking) && (
        <StackTypeControlGroup
          clusterId={cluster.id}
          isDualStackSelectable={isDualStackSelectable}
          isSNO={isSNOCluster}
          hostSubnets={hostSubnets}
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
