import React from 'react';
import { useFormikContext } from 'formik';
import { TextContent, Radio, Text, FormGroup } from '@patternfly/react-core';
import BasicNetworkFields from './BasicNetworkFields';
import AdvancedNetworkFields from './AdvancedNetworkFields';
import { HostSubnets, ClusterConfigurationValues } from '../../types/clusters';
import { InputField, CheckboxField, SelectField } from '../ui/formik';
import { ManagedDomain } from '../../api/types';

type NetworkConfigurationProps = {
  hostSubnets: HostSubnets;
  managedDomains: ManagedDomain[];
};

const NetworkConfiguration: React.FC<NetworkConfigurationProps> = ({
  hostSubnets,
  managedDomains,
}) => {
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
      the cluster name. This cannot be changed after cluster installation. The full cluster address will be:{' '}
      <strong>
        {clusterName || '[Cluster Name]'}.{baseDnsDomain || '[example.com]'}
      </strong>
    </>
  );

  const toggleRedHatDnsService = (checked: boolean) =>
    setFieldValue(
      'baseDnsDomain',
      checked ? managedDomains.map((d) => d.domain)[0] : initialValues.baseDnsDomain,
    );

  return (
    <>
      <TextContent>
        <Text component="h2">Networking</Text>
      </TextContent>
      {!!managedDomains.length && (
        <CheckboxField
          name="useRedHatDnsService"
          label="Use Red Hat's DNS service"
          helperText="A base DNS domain will be provided by Red Hat's DNS service. Because the cluster's DNS can't be changed after cluster installation, this should only be used for temporary, non-production clusters."
          onChange={toggleRedHatDnsService}
        />
      )}
      {values.useRedHatDnsService ? (
        <SelectField
          label="Base DNS Domain"
          name="baseDnsDomain"
          helperText={baseDnsHelperText}
          options={managedDomains.map((d) => ({
            label: `${d.domain} (${d.provider})`,
            value: d.domain,
          }))}
          isRequired
        />
      ) : (
        <InputField
          label="Base DNS Domain"
          name="baseDnsDomain"
          helperText={baseDnsHelperText}
          placeholder="example.com"
          isDisabled={useRedHatDnsService}
          isRequired
        />
      )}
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
