import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import { Checkbox } from '@patternfly/react-core';
import AdvancedNetworkFields from './AdvancedNetworkFields';
import { NetworkConfigurationValues } from '../../../common/types/clusters';
import {
  AvailableSubnetsControl,
  ManagedNetworkingControlGroup,
  UserManagedNetworkingTextContent,
  VirtualIPControlGroup,
  VirtualIPControlGroupProps,
} from '../clusterWizard/networkingSteps';
import { RenderIf } from '../ui/RenderIf';
import { ClusterDefaultConfig } from '../../api';
import { isSingleNodeCluster } from '../clusters';
import { NO_SUBNET_SET } from '../../config';
import { isAdvNetworkConf } from './utils';

export type NetworkConfigurationProps = VirtualIPControlGroupProps & {
  defaultNetworkSettings: ClusterDefaultConfig;
};

const NetworkConfiguration = ({
  cluster,
  hostSubnets,
  isVipDhcpAllocationDisabled,
  defaultNetworkSettings,
}: NetworkConfigurationProps) => {
  const { setFieldValue, values, touched, validateField } = useFormikContext<
    NetworkConfigurationValues
  >();
  const [isAdvanced, setAdvanced] = React.useState(
    isAdvNetworkConf(cluster, defaultNetworkSettings),
  );

  const toggleAdvConfiguration = (checked: boolean) => {
    setAdvanced(checked);

    if (!checked) {
      setFieldValue('clusterNetworkCidr', defaultNetworkSettings.clusterNetworkCidr);
      setFieldValue('serviceNetworkCidr', defaultNetworkSettings.serviceNetworkCidr);
      setFieldValue('clusterNetworkHostPrefix', defaultNetworkSettings.clusterNetworkHostPrefix);
      setFieldValue('networkType', 'OpenShiftSDN');
    }
  };

  const isMultiNodeCluster = !isSingleNodeCluster(cluster);
  const isUserManagedNetworking = values.managedNetworkingType === 'userManaged';

  useEffect(() => {
    if (isUserManagedNetworking) {
      const shouldValidate = true;

      // We need to reset these fields' values in order to align with the values the server sends
      setFieldValue('vipDhcpAllocation', false);
      setFieldValue('ingressVip', '', !shouldValidate);
      setFieldValue('apiVip', '', !shouldValidate);
      if (!touched.hostSubnet || isMultiNodeCluster) {
        setFieldValue('hostSubnet', NO_SUBNET_SET, !shouldValidate);
      }
    } else {
      if (!values.vipDhcpAllocation) {
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
    <>
      <ManagedNetworkingControlGroup disabled={!isMultiNodeCluster} />

      <RenderIf condition={isUserManagedNetworking}>
        <UserManagedNetworkingTextContent shouldDisplayLoadBalancersBullet={isMultiNodeCluster} />
      </RenderIf>

      <RenderIf condition={!(isMultiNodeCluster && isUserManagedNetworking)}>
        <AvailableSubnetsControl
          hostSubnets={hostSubnets}
          hosts={cluster.hosts || []}
          isRequired={!isUserManagedNetworking}
        />
      </RenderIf>

      <RenderIf condition={!isUserManagedNetworking}>
        <VirtualIPControlGroup
          cluster={cluster}
          hostSubnets={hostSubnets}
          isVipDhcpAllocationDisabled={isVipDhcpAllocationDisabled}
        />
      </RenderIf>

      <Checkbox
        id="useAdvancedNetworking"
        label="Use advanced networking"
        description="Configure advanced networking properties (e.g. CIDR ranges)."
        isChecked={isAdvanced}
        onChange={toggleAdvConfiguration}
      />
      <RenderIf condition={isAdvanced}>
        <AdvancedNetworkFields />
      </RenderIf>
    </>
  );
};

export default NetworkConfiguration;
