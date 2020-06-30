import React from 'react';
import { HostSubnets, ClusterConfigurationValues } from '../../types/clusters';
import { InputField, SelectField } from '../ui/formik';
import { useFormikContext, useField } from 'formik';

type BasicNetworkFieldsProps = {
  hostSubnets: HostSubnets;
};

const BasicNetworkFields: React.FC<BasicNetworkFieldsProps> = ({ hostSubnets }) => {
  const { validateField } = useFormikContext<ClusterConfigurationValues>();
  const [clusterName] = useField({ name: 'name' });
  const [baseDnsField] = useField({ name: 'baseDnsDomain' });

  const baseDnsHelperText = (
    <>
      The base domain of the cluster. All DNS records must be sub-domains of this base and include
      the cluster name. This cannot be changed later. The full cluster address will be:{' '}
      <strong>
        {clusterName.value || '[Cluster Name]'}.{baseDnsField.value || '[example.com]'}
      </strong>
    </>
  );

  return (
    <>
      <InputField
        label="Base DNS Domain"
        name="baseDnsDomain"
        helperText={baseDnsHelperText}
        placeholder="example.com"
        isRequired
      />
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
