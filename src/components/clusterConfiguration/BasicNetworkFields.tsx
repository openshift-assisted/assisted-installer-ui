import React from 'react';
import { HostSubnets, ClusterConfigurationValues } from '../../types/clusters';
import { InputField, SelectField, SwitchField } from '../ui/formik';
import { useFormikContext } from 'formik';

type BasicNetworkFieldsProps = {
  hostSubnets: HostSubnets;
  isAdvanced: boolean;
};

const BasicNetworkFields: React.FC<BasicNetworkFieldsProps> = ({ hostSubnets, isAdvanced }) => {
  const { validateField, values, initialValues, setFieldValue, setFieldTouched } = useFormikContext<
    ClusterConfigurationValues
  >();

  const areVipDisabled = !hostSubnets.length || (values.vipDhcpAllocation && isAdvanced);

  const apiVipHelperText = `Virtual IP used to reach the OpenShift cluster API. ${
    values.vipDhcpAllocation && isAdvanced
      ? 'IP is allocated by DHCP server.'
      : `Make sure that the VIP's are unique and not used by any other device on your network.`
  }`;
  const ingressVipHelperText = `Virtual IP used for cluster ingress traffic. ${
    values.vipDhcpAllocation && isAdvanced ? 'IP is allocated by DHCP server.' : ''
  }`;

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
      {isAdvanced && (
        <SwitchField
          label="Use VIP DHCP allocation"
          name="vipDhcpAllocation"
          onChange={(checked: boolean) => {
            let apiVip: string | undefined;
            let ingressVip: string | undefined;
            if (checked) {
              if (initialValues.vipDhcpAllocation) {
                apiVip = initialValues.apiVip;
                ingressVip = initialValues.ingressVip;
              }
            } else if (!initialValues.vipDhcpAllocation) {
              apiVip = initialValues.apiVip;
              ingressVip = initialValues.ingressVip;
            }
            setFieldTouched('ingressVip', false);
            setFieldTouched('apiVip', false);
            setFieldValue('ingressVip', ingressVip || '');
            setFieldValue('apiVip', apiVip || '');
            setTimeout(() => {
              validateField('ingressVip');
              validateField('apiVip');
            }, 0);
          }}
        />
      )}
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
  );
};
export default BasicNetworkFields;
