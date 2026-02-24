import React, { useEffect, useCallback } from 'react';
import { useFormikContext } from 'formik';
import isCIDR from 'is-cidr';
import { Checkbox, Grid } from '@patternfly/react-core';
import { NetworkConfigurationValues } from '../../../common/types/clusters';
import {
  ManagedNetworkingControlGroup,
  UserManagedNetworkingTextContent,
  StackTypeControlGroup,
  AvailableSubnetsControl,
  VirtualIPControlGroup,
  VirtualIPControlGroupProps,
  AdvancedNetworkFields,
} from '../../../common/components/clusterWizard/networkingSteps';
import {
  canBeDualStack,
  canSelectNetworkTypeSDN,
  DUAL_STACK,
  isAdvNetworkConf,
  isSNO,
  NETWORK_TYPE_OVN,
} from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { NetworkTypeControlGroup } from '../../../common/components/clusterWizard/networkingSteps/NetworkTypeControlGroup';
import { ClusterDefaultConfig } from '@openshift-assisted/types/assisted-installer-service';

export type NetworkConfigurationProps = VirtualIPControlGroupProps & {
  defaultNetworkSettings: Pick<
    ClusterDefaultConfig,
    | 'clusterNetworksIpv4'
    | 'clusterNetworksIpv6'
    | 'clusterNetworksDualstack'
    | 'serviceNetworksIpv4'
    | 'serviceNetworksIpv6'
    | 'serviceNetworksDualstack'
  >;
  hideManagedNetworking?: boolean;
};

const NetworkConfiguration = ({
  cluster,
  hostSubnets,
  isVipDhcpAllocationDisabled,
  defaultNetworkSettings,
  hideManagedNetworking,
}: NetworkConfigurationProps) => {
  const { t } = useTranslation();
  const { setFieldValue, values, touched, validateField } =
    useFormikContext<NetworkConfigurationValues>();

  const isMultiNodeCluster = !isSNO(cluster);
  const isDualStackSelectable = React.useMemo(() => canBeDualStack(hostSubnets), [hostSubnets]);

  const isDualStack = values.stackType === DUAL_STACK;
  const isSDNSelectable = React.useMemo(
    () => canSelectNetworkTypeSDN(!isMultiNodeCluster, isDualStack),
    [isMultiNodeCluster, isDualStack],
  );

  const [isAdvanced, setAdvanced] = React.useState(
    isDualStack || isAdvNetworkConf(cluster, defaultNetworkSettings),
  );

  const toggleAdvConfiguration = useCallback(
    (checked: boolean) => {
      setAdvanced(checked);

      if (!checked) {
        const primaryCidr = values.machineNetworks?.[0]?.cidr;
        const useIPv6Defaults = primaryCidr && isCIDR.v6(primaryCidr);
        setFieldValue(
          'clusterNetworks',
          useIPv6Defaults
            ? defaultNetworkSettings.clusterNetworksIpv6
            : defaultNetworkSettings.clusterNetworksIpv4,
        );
        setFieldValue(
          'serviceNetworks',
          useIPv6Defaults
            ? defaultNetworkSettings.serviceNetworksIpv6
            : defaultNetworkSettings.serviceNetworksIpv4,
        );
      }
    },
    [setFieldValue, defaultNetworkSettings, values.machineNetworks],
  );

  // Auto-enable advanced networking when switching to dual-stack
  useEffect(() => {
    if (isDualStack) {
      toggleAdvConfiguration(true);
    }
  }, [isDualStack, toggleAdvConfiguration]);

  // Sync cluster/service networks to match primary machine network family when single-stack (fix mismatch)
  useEffect(() => {
    if (isDualStack) {
      return;
    }
    const primaryCidr = values.machineNetworks?.[0]?.cidr;
    const firstClusterCidr = values.clusterNetworks?.[0]?.cidr;
    if (!primaryCidr || !firstClusterCidr) {
      return;
    }
    const primaryIsIPv6 = isCIDR.v6(primaryCidr);
    const primaryIsIPv4 = isCIDR.v4(primaryCidr);
    const clusterIsIPv6 = isCIDR.v6(firstClusterCidr);
    const clusterIsIPv4 = isCIDR.v4(firstClusterCidr);

    if (primaryIsIPv4 && clusterIsIPv6) {
      setFieldValue('clusterNetworks', defaultNetworkSettings.clusterNetworksIpv4);
      setFieldValue('serviceNetworks', defaultNetworkSettings.serviceNetworksIpv4);
    } else if (primaryIsIPv6 && clusterIsIPv4) {
      setFieldValue('clusterNetworks', defaultNetworkSettings.clusterNetworksIpv6);
      setFieldValue('serviceNetworks', defaultNetworkSettings.serviceNetworksIpv6);
    }
  }, [
    isDualStack,
    values.machineNetworks,
    values.clusterNetworks,
    values.serviceNetworks,
    setFieldValue,
    defaultNetworkSettings,
  ]);

  const isUserManagedNetworking = values.managedNetworkingType === 'userManaged';
  const primaryMachineNetwork = values.machineNetworks?.[0]?.cidr;

  // Clear machine networks when switching to user-managed networking for multi-node clusters
  useEffect(() => {
    if (isUserManagedNetworking && isMultiNodeCluster && values.machineNetworks?.length) {
      setFieldValue('machineNetworks', [], false);
    }
  }, [isUserManagedNetworking, isMultiNodeCluster, values.machineNetworks?.length, setFieldValue]);
  useEffect(() => {
    if (!cluster.networkType) {
      setFieldValue('networkType', NETWORK_TYPE_OVN);
    }
    // Skipping "cluster.networkType" as it's ultimately the value we are setting in the form
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDualStack, isMultiNodeCluster, setFieldValue]);

  useEffect(() => {
    if (isUserManagedNetworking) {
      const shouldValidate = !!touched.machineNetworks;

      // We need to reset these fields' values in order to align with the values the server sends
      setFieldValue('vipDhcpAllocation', false);
      setFieldValue('ingressVips', [], shouldValidate);
      setFieldValue('apiVips', [], shouldValidate);
    } else {
      if (!values.vipDhcpAllocation) {
        validateField('ingressVips');
        validateField('apiVips');
      }
    }
  }, [
    touched.machineNetworks,
    isMultiNodeCluster,
    isUserManagedNetworking,
    setFieldValue,
    values.vipDhcpAllocation,
    validateField,
    primaryMachineNetwork,
  ]);
  return (
    <Grid hasGutter>
      {!hideManagedNetworking && <ManagedNetworkingControlGroup />}

      {isUserManagedNetworking && (
        <UserManagedNetworkingTextContent
          shouldDisplayLoadBalancersBullet={isMultiNodeCluster}
          docVersion={cluster.openshiftVersion}
        />
      )}

      {(!isMultiNodeCluster || !isUserManagedNetworking) && (
        <StackTypeControlGroup
          clusterId={cluster.id}
          isDualStackSelectable={isDualStackSelectable}
          hostSubnets={hostSubnets}
          defaultNetworkValues={defaultNetworkSettings}
          allowSingleStackIPv6
        />
      )}

      <NetworkTypeControlGroup isSDNSelectable={isSDNSelectable} />

      {!(isMultiNodeCluster && isUserManagedNetworking) && (
        <AvailableSubnetsControl
          clusterId={cluster.id}
          hostSubnets={hostSubnets}
          isRequired={!isUserManagedNetworking}
          isDisabled={hostSubnets.length === 0}
          openshiftVersion={cluster.openshiftVersion}
          hosts={cluster.hosts || []}
          isMultiNodeCluster={isMultiNodeCluster}
          allowSingleStackIPv6
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
        label={t('ai:Use advanced networking')}
        description={t('ai:Configure advanced networking properties (e.g. CIDR ranges).')}
        isChecked={isAdvanced}
        onChange={(_event, checked: boolean) => toggleAdvConfiguration(checked)}
        isDisabled={isDualStack}
        body={isAdvanced && <AdvancedNetworkFields />}
      />
    </Grid>
  );
};

export default NetworkConfiguration;
