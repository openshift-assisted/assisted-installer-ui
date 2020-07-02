import React from 'react';
import { useFormikContext } from 'formik';
import { TextContent, Radio, Text, FormGroup } from '@patternfly/react-core';
import BasicNetworkFields from './BasicNetworkFields';
import AdvancedNetworkFields from './AdvancedNetworkFields';
import { HostSubnets, ClusterConfigurationValues } from '../../types/clusters';
import { InputField, CheckboxField } from '../ui/formik';
import { RED_HAT_DNS_SERVICE_DOMAINS } from '../../config';

type NetworkConfigurationProps = {
  hostSubnets: HostSubnets;
};

const NetworkConfiguration: React.FC<NetworkConfigurationProps> = ({ hostSubnets }) => {
  const [type, setType] = React.useState<'basic' | 'advanced'>('basic');
  const { setFieldValue, initialValues, values } = useFormikContext<ClusterConfigurationValues>();
  const { name: clusterName, baseDnsDomain, useRedHatDnsService } = values;

  const backToBasic = () => {
    // Reset the advanced networking values
    const { clusterNetworkCidr, clusterNetworkHostPrefix, serviceNetworkCidr } = initialValues;
    setFieldValue('clusterNetworkCidr', clusterNetworkCidr);
    setFieldValue('clusterNetworkHostPrefix', clusterNetworkHostPrefix);
    setFieldValue('serviceNetworkCidr', serviceNetworkCidr);
    setType('basic');
  };

  const baseDnsHelperText = (
    <>
      The base domain of the cluster. All DNS records must be sub-domains of this base and include
      the cluster name. This cannot be changed later. The full cluster address will be:{' '}
      <strong>
        {clusterName || '[Cluster Name]'}.{baseDnsDomain || '[example.com]'}
      </strong>
    </>
  );

  const toggleRedHatDnsService = (checked: boolean) => {
    if (checked) {
      setFieldValue('baseDnsDomain', RED_HAT_DNS_SERVICE_DOMAINS[0]);
    } else {
      setFieldValue('baseDnsDomain', initialValues.baseDnsDomain);
    }
  };

  return (
    <>
      <TextContent>
        <Text component="h2">Networking</Text>
      </TextContent>
      <CheckboxField
        name="useRedHatDnsService"
        label="Use Red Hat's DNS service"
        helperText="A base DNS domain will be provided by Red Hat's DNS service. Because the cluster's DNS can't be changed later, this should only be used for temporary, non-production clusters."
        onChange={toggleRedHatDnsService}
      />
      <InputField
        label="Base DNS Domain"
        name="baseDnsDomain"
        helperText={baseDnsHelperText}
        placeholder="example.com"
        isDisabled={useRedHatDnsService}
        isRequired
      />
      <FormGroup fieldId="networkConfigurationType" label="Network Configuration">
        <Radio
          id="networkConfigurationTypeBasic"
          name="networkConfigurationType"
          isChecked={type === 'basic'}
          value="basic"
          onChange={backToBasic}
          label="Basic"
          description="Use default networking options."
          isLabelWrapped
        />
        <Radio
          id="networkConfigurationTypeAdvanced"
          name="networkConfigurationType"
          value="advanced"
          isChecked={type === 'advanced'}
          onChange={() => setType('advanced')}
          label="Advanced"
          description="Configure a custom networking type and CIDR ranges."
          isLabelWrapped
        />
      </FormGroup>
      <BasicNetworkFields hostSubnets={hostSubnets} />
      {type === 'advanced' && <AdvancedNetworkFields />}
    </>
  );
};

export default NetworkConfiguration;
