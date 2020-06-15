import React from 'react';
import { useFormikContext } from 'formik';
import { TextContent, Radio, Text, FormGroup } from '@patternfly/react-core';
import BasicNetworkFields from './BasicNetworkFields';
import AdvancedNetworkFields from './AdvancedNetworkFields';
import { HostSubnets, ClusterConfigurationValues } from '../../types/clusters';

type NetworkConfigurationProps = {
  hostSubnets: HostSubnets;
};

const NetworkConfiguration: React.FC<NetworkConfigurationProps> = ({ hostSubnets }) => {
  const [type, setType] = React.useState<'basic' | 'advanced'>('basic');
  const { setFieldValue, initialValues } = useFormikContext<ClusterConfigurationValues>();

  const backToBasic = () => {
    // Reset the advanced networking values
    const { clusterNetworkCidr, clusterNetworkHostPrefix, serviceNetworkCidr } = initialValues;
    setFieldValue('clusterNetworkCidr', clusterNetworkCidr);
    setFieldValue('clusterNetworkHostPrefix', clusterNetworkHostPrefix);
    setFieldValue('serviceNetworkCidr', serviceNetworkCidr);
    setType('basic');
  };

  return (
    <>
      <TextContent>
        <Text component="h2">Networking</Text>
      </TextContent>
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
