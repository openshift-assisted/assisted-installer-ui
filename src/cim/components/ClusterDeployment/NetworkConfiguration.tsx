import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import { Checkbox, Grid } from '@patternfly/react-core';
import AdvancedNetworkFields from '../../../common/components/clusterConfiguration/AdvancedNetworkFields';
import { NetworkConfigurationValues } from '../../../common/types/clusters';
import { Address6 } from 'ip-address';
import {
  AvailableSubnetsControl,
  ManagedNetworkingControlGroup,
  UserManagedNetworkingTextContent,
  VirtualIPControlGroup,
  VirtualIPControlGroupProps,
} from '../../../common/components/clusterWizard/networkingSteps';
import {
  canSelectNetworkTypeSDN,
  ClusterDefaultConfig,
  getDefaultNetworkType,
  isAdvNetworkConf,
  isSNO,
  isSubnetInIPv6,
  NETWORK_TYPE_OVN,
  NO_SUBNET_SET,
} from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

export type NetworkConfigurationProps = VirtualIPControlGroupProps & {
  defaultNetworkSettings: ClusterDefaultConfig;
  hideManagedNetworking?: boolean;
};

const NetworkConfiguration: React.FC<NetworkConfigurationProps> = ({
  cluster,
  hostSubnets,
  isVipDhcpAllocationDisabled,
  defaultNetworkSettings,
  hideManagedNetworking,
  children,
}) => {
  const { t } = useTranslation();
  const { setFieldValue, values, touched, validateField } =
    useFormikContext<NetworkConfigurationValues>();

  const isMultiNodeCluster = !isSNO(cluster);
  const isClusterCIDRIPv6 = Address6.isValid(values.clusterNetworkCidr || '');
  const { isIPv6, defaultNetworkType, isSDNSelectable } = React.useMemo(() => {
    const isIPv6 = isSubnetInIPv6({
      machineNetworkCidr: cluster.machineNetworkCidr,
      clusterNetworkCidr: values.clusterNetworkCidr,
      serviceNetworkCidr: values.serviceNetworkCidr,
    });
    return {
      isIPv6,
      defaultNetworkType: getDefaultNetworkType(!isMultiNodeCluster, isIPv6),
      isSDNSelectable: canSelectNetworkTypeSDN(!isMultiNodeCluster, isIPv6),
    };
  }, [
    isMultiNodeCluster,
    values.clusterNetworkCidr,
    cluster.machineNetworkCidr,
    values.serviceNetworkCidr,
  ]);

  const [isAdvanced, setAdvanced] = React.useState(
    isAdvNetworkConf(cluster, defaultNetworkSettings, defaultNetworkType),
  );

  const toggleAdvConfiguration = (checked: boolean) => {
    setAdvanced(checked);

    if (!checked) {
      setFieldValue('clusterNetworkCidr', defaultNetworkSettings.clusterNetworkCidr);
      setFieldValue('serviceNetworkCidr', defaultNetworkSettings.serviceNetworkCidr);
      setFieldValue('clusterNetworkHostPrefix', defaultNetworkSettings.clusterNetworkHostPrefix);
      setFieldValue('networkType', defaultNetworkType);
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
        <ManagedNetworkingControlGroup disabled={!!cluster.openshiftVersion} />
      )}

      {isUserManagedNetworking && (
        <UserManagedNetworkingTextContent shouldDisplayLoadBalancersBullet={isMultiNodeCluster} />
      )}

      {children}

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
        label={t('ai:Use advanced networking')}
        description={t('ai:Configure advanced networking properties (e.g. CIDR ranges).')}
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
