import React, { useCallback, useEffect, useMemo } from 'react';
import { useFormikContext } from 'formik';
import { Alert, AlertVariant, Checkbox, Grid } from '@patternfly/react-core';
import { VirtualIPControlGroup, VirtualIPControlGroupProps } from './VirtualIPControlGroup';
import { Cluster } from '../../../../common/api/types';
import { useFeatureSupportLevel } from '../../../../common/components/featureSupportLevels';
import { NetworkConfigurationValues } from '../../../../common/types';
import { getLimitedFeatureSupportLevels } from '../../../../common/components/featureSupportLevels/utils';
import { useFeature } from '../../../../common/features';
import { isAdvNetworkConf } from '../../../../common/components/clusterConfiguration';
import { isSNO } from '../../../../common/selectors';
import { Address4 } from 'ip-address';
import {
  ManagedNetworkingControlGroup,
  UserManagedNetworkingTextContent,
} from '../../../../common/components/clusterWizard/networkingSteps';
import { StackTypeControlGroup } from './StackTypeControl';
import { AvailableSubnetsControl } from './AvailableSubnetsControl';
import AdvancedNetworkFields from './AdvancedNetworkFields';

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
  const { setFieldValue, values, touched, validateField } = useFormikContext<
    NetworkConfigurationValues
  >();

  const clusterFeatureSupportLevels = React.useMemo(() => {
    return getLimitedFeatureSupportLevels(cluster, featureSupportLevelData);
  }, [cluster, featureSupportLevelData]);

  const isNetworkTypeSelectionEnabled = useFeature(
    'ASSISTED_INSTALLER_NETWORK_TYPE_SELECTION_FEATURE',
  );

  const [isAdvanced, setAdvanced] = React.useState(
    isAdvNetworkConf(cluster, defaultNetworkSettings) || values.stackType === 'dualStack',
  );

  const isMultiNodeCluster = !isSNO(cluster);
  const isUserManagedNetworking = values.managedNetworkingType === 'userManaged';

  useEffect(() => {
    if (isUserManagedNetworking) {
      // We need to reset these fields' values in order to align with the values the server sends
      setFieldValue('vipDhcpAllocation', false);
      setFieldValue('ingressVip', '', false);
      setFieldValue('apiVip', '', false);

      if (!touched.machineNetworks || isMultiNodeCluster) {
        setFieldValue('machineNetworks', [], false);
      }
    } else {
      if (!values.vipDhcpAllocation && touched.machineNetworks) {
        validateField('ingressVip');
        validateField('apiVip');
      }
    }
  }, [
    isMultiNodeCluster,
    isUserManagedNetworking,
    values.vipDhcpAllocation,
    touched.machineNetworks,
    setFieldValue,
    validateField,
  ]);

  const toggleAdvConfiguration = useCallback(
    (checked: boolean) => {
      setAdvanced(checked);

      if (!checked) {
        setFieldValue('clusterNetworks', defaultNetworkSettings.clusterNetworks, false);
        setFieldValue('serviceNetworks', defaultNetworkSettings.serviceNetworks, false);
        setFieldValue('networkType', 'OpenshiftSDN');
      }
    },
    [setFieldValue, setAdvanced, defaultNetworkSettings],
  );

  useEffect(() => {
    if (values.stackType === 'dualStack' && !isUserManagedNetworking) {
      toggleAdvConfiguration(true);
    }
  }, [values.stackType, toggleAdvConfiguration, isUserManagedNetworking]);

  const enableSDN = useMemo(
    () =>
      values.machineNetworks?.every((network) => network.cidr && Address4.isValid(network.cidr)) &&
      values.clusterNetworks?.every((network) => network.cidr && Address4.isValid(network.cidr)) &&
      values.serviceNetworks?.every((network) => network.cidr && Address4.isValid(network.cidr)),
    [values],
  );

  useEffect(() => {
    if (isNetworkTypeSelectionEnabled && !enableSDN) {
      setFieldValue('vipDhcpAllocation', false);
      setFieldValue('networkType', 'OVNKubernetes');
    }
  }, [isNetworkTypeSelectionEnabled, enableSDN, setFieldValue]);

  return (
    <Grid hasGutter>
      {!hideManagedNetworking && (
        <ManagedNetworkingControlGroup
          disabled={
            !!cluster.openshiftVersion &&
            featureSupportLevelData.isFeatureDisabled(
              cluster.openshiftVersion,
              'NETWORK_TYPE_SELECTION',
            )
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

      {!(isMultiNodeCluster && isUserManagedNetworking) && (
        <StackTypeControlGroup clusterId={cluster.id} />
      )}

      {!(isMultiNodeCluster && isUserManagedNetworking) && (
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

      <Checkbox
        id="useAdvancedNetworking"
        label="Use advanced networking"
        description="Configure advanced networking properties (e.g. CIDR ranges)."
        isChecked={isAdvanced}
        onChange={toggleAdvConfiguration}
      />

      {isAdvanced && <AdvancedNetworkFields clusterId={cluster.id} enableSDN={enableSDN} />}
    </Grid>
  );
};

export default NetworkConfiguration;
