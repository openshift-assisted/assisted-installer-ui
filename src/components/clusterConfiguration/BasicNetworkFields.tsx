import React from 'react';
import { HostSubnets, ClusterConfigurationValues } from '../../types/clusters';
import { InputField, SelectField, SwitchField } from '../ui/formik';
import { useFormikContext } from 'formik';

type BasicNetworkFieldsProps = {
  hostSubnets: HostSubnets;
  isAdvanced: boolean;
};

const BasicNetworkFields: React.FC<BasicNetworkFieldsProps> = ({ hostSubnets, isAdvanced }) => {
  const { validateField, values } = useFormikContext<ClusterConfigurationValues>();
  const { hostSubnet } = values;

  const subnet = hostSubnet ? ` (${hostSubnet})` : '';

  const areVipDisabled = !hostSubnets.length;

  let apiVipHelperText = `Virtual IP used to reach the OpenShift cluster API. Make sure that the VIP's are unique and not used by any other device on your network${subnet}.`;
  let ingressVipHelperText = 'Virtual IP used for cluster ingress traffic.';
  if (areVipDisabled) {
    const suffix = ' This field will become available once at least one host gets discovered.';
    apiVipHelperText += suffix;
    ingressVipHelperText += suffix;
  }

  return (
    <>
      <SelectField
        name="hostSubnet"
        label="Available subnets"
        options={
          hostSubnets.length
            ? hostSubnets.map((hn) => ({
                label: hn.humanized,
                value: hn.humanized,
              }))
            : [{ label: 'No subnets currently available', value: 'nosubnets' }]
        }
        getHelperText={(value) => {
          const matchingSubnet = hostSubnets.find((hn) => hn.humanized === value);
          return matchingSubnet
            ? `Subnet is available on hosts: ${matchingSubnet.hostIDs.join(', ')}`
            : undefined;
        }}
        onChange={() => {
          validateField('ingressVip');
          validateField('apiVip');
        }}
        isRequired
      />
      {isAdvanced && <SwitchField label="Use VIP DHCP allocation" name="vipDhcpAllocation" />}
      {(!values.vipDhcpAllocation || !isAdvanced) && (
        <>
          <InputField
            label="API Virtual IP"
            name="apiVip"
            helperText={apiVipHelperText}
            isRequired
            isDisabled={areVipDisabled}
          />
          <InputField
            name="ingressVip"
            label="Ingress Virtual IP"
            helperText={ingressVipHelperText}
            isRequired
            isDisabled={areVipDisabled}
          />
        </>
      )}
    </>
  );
};
export default BasicNetworkFields;
