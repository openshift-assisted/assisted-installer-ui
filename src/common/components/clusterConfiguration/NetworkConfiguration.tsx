import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import { Alert, AlertVariant, Checkbox, Grid } from '@patternfly/react-core';
import AdvancedNetworkFields from './AdvancedNetworkFields';
import { NetworkConfigurationValues } from '../../../common/types/clusters';
import {
  AvailableSubnetsControl,
  ManagedNetworkingControlGroup,
  UserManagedNetworkingTextContent,
  VirtualIPControlGroup,
  VirtualIPControlGroupProps,
} from '../clusterWizard/networkingSteps';
import { ClusterDefaultConfig } from '../../api';
import { NETWORK_TYPE_OVN, NO_SUBNET_SET } from '../../config';
import { isAdvNetworkConf } from './utils';
import { useFeatureSupportLevel } from '../featureSupportLevels';
import { getLimitedFeatureSupportLevels } from '../featureSupportLevels/utils';
import {
  canSelectNetworkTypeSDN,
  getDefaultNetworkType,
  isSNO,
  isSubnetInIPv6,
} from '../../selectors';
import { Address6 } from 'ip-address';

export type NetworkConfigurationProps = VirtualIPControlGroupProps & {
  defaultNetworkSettings: ClusterDefaultConfig;
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
  const [isAdvanced, setAdvanced] = React.useState(
    isAdvNetworkConf(cluster, defaultNetworkSettings),
  );
  const isMultiNodeCluster = !isSNO(cluster);
  const isClusterCIDRIPv6 = Address6.isValid(values.clusterNetworkCidr || '');
  const isIPv6 = React.useMemo(
    () =>
      isSubnetInIPv6({
        machineNetworkCidr: values.machineNetworkCidr,
        clusterNetworkCidr: values.clusterNetworkCidr,
        serviceNetworkCidr: values.serviceNetworkCidr,
      }),
    [values.clusterNetworkCidr, values.machineNetworkCidr, values.serviceNetworkCidr],
  );
  const isSDNSelectable = canSelectNetworkTypeSDN(!isMultiNodeCluster, isIPv6);

  const toggleAdvConfiguration = (checked: boolean) => {
    setAdvanced(checked);

    if (!checked) {
      setFieldValue('clusterNetworkCidr', defaultNetworkSettings.clusterNetworkCidr);
      setFieldValue('serviceNetworkCidr', defaultNetworkSettings.serviceNetworkCidr);
      setFieldValue('clusterNetworkHostPrefix', defaultNetworkSettings.clusterNetworkHostPrefix);
      setFieldValue('networkType', getDefaultNetworkType(!isMultiNodeCluster, isIPv6));
    }
  };

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
      setFieldValue('networkType', getDefaultNetworkType(!isMultiNodeCluster, isIPv6));
    } else if (!isSDNSelectable) {
      setFieldValue('networkType', NETWORK_TYPE_OVN);
    }
    // Skipping "cluster.networkType" as it's ultimately the value we are setting in the form
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIPv6, isMultiNodeCluster, setFieldValue]);

  useEffect(() => {
    if (isUserManagedNetworking) {
      const shouldValidate = !!touched.hostSubnet;

      // We need to reset these fields' values in order to align with the values the server sends
      setFieldValue('vipDhcpAllocation', false);
      setFieldValue('ingressVip', '', shouldValidate);
      setFieldValue('apiVip', '', shouldValidate);
    } else {
      if (!values.vipDhcpAllocation && touched.hostSubnet) {
        validateField('ingressVip');
        validateField('apiVip');
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
        <AvailableSubnetsControl
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
        body={
          isAdvanced && (
            <AdvancedNetworkFields
              isSDNSelectable={isSDNSelectable}
              isClusterCIDRIPv6={isClusterCIDRIPv6}
            />
          )
        }
      />
    </Grid>
  );
};

export default NetworkConfiguration;
