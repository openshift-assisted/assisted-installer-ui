import React from 'react';
import { useFormikContext } from 'formik';
import { Spinner } from '@patternfly/react-core';
import { HostSubnets, ClusterConfigurationValues } from '../../types/clusters';
import { InputField, SelectField, SwitchField } from '../ui/formik';
import { Cluster } from '../../api/types';
import StaticTextField from '../ui/StaticTextField';
import { NO_SUBNET_SET } from './utils';

type VipStaticValueProps = {
  vipName: string;
  cluster: Cluster;
};

const VipStaticValue: React.FC<VipStaticValueProps> = ({ vipName, cluster }) => {
  const { vipDhcpAllocation, machineNetworkCidr } = cluster;
  if (vipDhcpAllocation && cluster[vipName]) {
    return cluster[vipName];
  }
  if (vipDhcpAllocation && machineNetworkCidr) {
    return (
      <>
        <Spinner size="md" />
        <i> This IP is being allocated by the DHCP server</i>
      </>
    );
  }
  return <i>This IP will be allocated by the DHCP server</i>;
};

const getVipHelperSuffix = (
  vip?: string,
  vipDhcpAllocation?: boolean,
  vipDhcpAllocationFormValue?: boolean,
): string => {
  if (!vipDhcpAllocationFormValue) {
    return 'Make sure that the VIP is unique and not used by any other device on your network.';
  }
  if (vipDhcpAllocation && vip) {
    return 'This IP was allocated by the DHCP server.';
  }
  return '';
};

type BasicNetworkFieldsProps = {
  cluster: Cluster;
  hostSubnets: HostSubnets;
};

const BasicNetworkFields: React.FC<BasicNetworkFieldsProps> = ({ cluster, hostSubnets }) => {
  const { validateField, values } = useFormikContext<ClusterConfigurationValues>();

  const apiVipHelperText = `Virtual IP used to reach the OpenShift cluster API. ${getVipHelperSuffix(
    cluster.apiVip,
    cluster.vipDhcpAllocation,
    values.vipDhcpAllocation,
  )}`;
  const ingressVipHelperText = `Virtual IP used for cluster ingress traffic. ${getVipHelperSuffix(
    cluster.ingressVip,
    cluster.vipDhcpAllocation,
    values.vipDhcpAllocation,
  )}`;

  return (
    <>
      <SelectField
        name="hostSubnet"
        label="Available subnets"
        options={
          hostSubnets.length
            ? [
                {
                  label: `Please select a subnet. (${hostSubnets.length} subnets available)`,
                  value: NO_SUBNET_SET,
                  isDisabled: true,
                },
                ...hostSubnets.map((hn) => ({
                  label: hn.humanized,
                  value: hn.humanized,
                })),
              ]
            : [{ label: 'No subnets are currently available', value: NO_SUBNET_SET }]
        }
        getHelperText={(value) => {
          const matchingSubnet = hostSubnets.find((hn) => hn.humanized === value);
          return matchingSubnet
            ? `Subnet is available on hosts: ${matchingSubnet.hostIDs.join(', ')}`
            : undefined;
        }}
        onChange={() => {
          if (!values.vipDhcpAllocation) {
            validateField('ingressVip');
            validateField('apiVip');
          }
        }}
        isDisabled={!hostSubnets.length}
        isRequired
      />
      <SwitchField label="Allocate virtual IPs via DHCP server" name="vipDhcpAllocation" />
      {values.vipDhcpAllocation ? (
        <>
          <StaticTextField
            label="API Virtual IP"
            name="apiVip"
            helperText={apiVipHelperText}
            value={<VipStaticValue vipName="apiVip" cluster={cluster} />}
            isRequired
          />
          <StaticTextField
            label="Ingress Virtual IP"
            name="ingressVip"
            helperText={ingressVipHelperText}
            value={<VipStaticValue vipName="ingressVip" cluster={cluster} />}
            isRequired
          />
        </>
      ) : (
        <>
          <InputField
            label="API Virtual IP"
            name="apiVip"
            helperText={apiVipHelperText}
            isRequired
            isDisabled={!hostSubnets.length || values.hostSubnet === NO_SUBNET_SET}
          />
          <InputField
            name="ingressVip"
            label="Ingress Virtual IP"
            helperText={ingressVipHelperText}
            isRequired
            isDisabled={!hostSubnets.length || values.hostSubnet === NO_SUBNET_SET}
          />
        </>
      )}
    </>
  );
};
export default BasicNetworkFields;
