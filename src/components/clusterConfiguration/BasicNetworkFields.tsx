import React from 'react';
import { HostSubnets, ClusterConfigurationValues } from '../../types/clusters';
import { InputField, SelectField } from '../ui/formik';
import { useFormikContext } from 'formik';

type BasicNetworkFieldsProps = {
  hostSubnets: HostSubnets;
};

const BasicNetworkFields: React.FC<BasicNetworkFieldsProps> = ({ hostSubnets }) => {
  const { validateField } = useFormikContext<ClusterConfigurationValues>();
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
            : [{ label: 'No subnets available', value: 'nosubnets' }]
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
      <InputField
        label="API Virtual IP"
        name="apiVip"
        helperText="Virtual IP used to reach the OpenShift cluster API. Make sure that the VIP's are unique and not used by any other device on your network."
        isRequired
        isDisabled={!hostSubnets.length}
      />
      <InputField
        name="ingressVip"
        label="Ingress Virtual IP"
        helperText="Virtual IP used for cluster ingress traffic."
        isRequired
        isDisabled={!hostSubnets.length}
      />
    </>
  );
};
export default BasicNetworkFields;
