import React, { useEffect, useCallback } from 'react';
import { useFormikContext } from 'formik';
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
  NO_SUBNET_SET,
} from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { NetworkTypeControlGroup } from '../../../common/components/clusterWizard/networkingSteps/NetworkTypeControlGroup';
import { ClusterDefaultConfig } from '@openshift-assisted/types/assisted-installer-service';

export type NetworkConfigurationProps = VirtualIPControlGroupProps & {
  defaultNetworkSettings: ClusterDefaultConfig;
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

  const isSNOCluster = isSNO(cluster);
  const isMultiNodeCluster = !isSNOCluster;
  const isDualStackSelectable = React.useMemo(() => canBeDualStack(hostSubnets), [hostSubnets]);
  
  const isDualStack = values.stackType === DUAL_STACK;
  const isSDNSelectable = React.useMemo(
    () => canSelectNetworkTypeSDN(!isMultiNodeCluster),
    [isMultiNodeCluster],
  );

  const [isAdvanced, setAdvanced] = React.useState(
    isDualStack || isAdvNetworkConf(cluster, defaultNetworkSettings),
  );

  const toggleAdvConfiguration = useCallback(
    (checked: boolean) => {
      setAdvanced(checked);

      if (!checked) {
        setFieldValue('clusterNetworks', defaultNetworkSettings.clusterNetworksIpv4);
        setFieldValue('serviceNetworks', defaultNetworkSettings.serviceNetworksIpv4);
      }
    },
    [setFieldValue, defaultNetworkSettings],
  );

  // Auto-enable advanced networking when switching to dual-stack
  useEffect(() => {
    if (isDualStack) {
      toggleAdvConfiguration(true);
    }
  }, [isDualStack, toggleAdvConfiguration]);

  const isUserManagedNetworking = values.managedNetworkingType === 'userManaged';
  const firstSubnet = hostSubnets[0]?.subnet;

  useEffect(() => {
    if (isUserManagedNetworking && isMultiNodeCluster) {
      values.hostSubnet !== NO_SUBNET_SET && setFieldValue('hostSubnet', NO_SUBNET_SET, false);
    } else if (values.hostSubnet === NO_SUBNET_SET && firstSubnet) {
      setFieldValue('hostSubnet', firstSubnet, false);
    }
  }, [isUserManagedNetworking, isMultiNodeCluster, values.hostSubnet, setFieldValue, firstSubnet]);

  useEffect(() => {
    if (!cluster.networkType) {
      setFieldValue('networkType', NETWORK_TYPE_OVN);
    }
    // Skipping "cluster.networkType" as it's ultimately the value we are setting in the form
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDualStack, isMultiNodeCluster, setFieldValue]);

  useEffect(() => {
    if (isUserManagedNetworking) {
      const shouldValidate = !!touched.hostSubnet;

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
    touched.hostSubnet,
    isMultiNodeCluster,
    isUserManagedNetworking,
    setFieldValue,
    values.vipDhcpAllocation,
    validateField,
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

      {(isSNOCluster || !isUserManagedNetworking) && (
        <StackTypeControlGroup
          clusterId={cluster.id}
          isDualStackSelectable={isDualStackSelectable}
          hostSubnets={hostSubnets}
          defaultNetworkValues={defaultNetworkSettings}
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
