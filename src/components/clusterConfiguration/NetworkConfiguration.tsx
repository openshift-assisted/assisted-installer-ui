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
  const { setFieldValue, initialValues, values, validateField } = useFormikContext<
    ClusterConfigurationValues
  >();
  const [isAdvanced, setAdvanced] = React.useState<boolean>(!!values.vipDhcpAllocation);
  const { name: clusterName, baseDnsDomain, useRedHatDnsService } = values;

  const toBasic = () => {
    // Reset the advanced networking values
    const {
      clusterNetworkCidr,
      clusterNetworkHostPrefix,
      serviceNetworkCidr,
      vipDhcpAllocation,
      apiVip,
      ingressVip,
    } = initialValues;
    setFieldValue('clusterNetworkCidr', clusterNetworkCidr);
    setFieldValue('clusterNetworkHostPrefix', clusterNetworkHostPrefix);
    setFieldValue('serviceNetworkCidr', serviceNetworkCidr);
    setFieldValue('vipDhcpAllocation', false);
    setFieldValue('apiVip', vipDhcpAllocation ? '' : apiVip);
    setFieldValue('ingressVip', vipDhcpAllocation ? '' : ingressVip);
    setTimeout(() => {
      validateField('ingressVip');
      validateField('apiVip');
    }, 0);
    setAdvanced(false);
  };

  const toAdvanced = () => {
    const { vipDhcpAllocation, apiVip, ingressVip } = initialValues;
    setFieldValue('vipDhcpAllocation', vipDhcpAllocation);
    vipDhcpAllocation && setFieldValue('apiVip', apiVip);
    vipDhcpAllocation && setFieldValue('ingressVip', ingressVip);
    setTimeout(() => {
      validateField('ingressVip');
      validateField('apiVip');
    }, 0);
    setAdvanced(true);
  };

  const baseDnsHelperText = (
    <>
      All DNS records must be subdomains of this base and include the cluster name. This cannot be
      changed after cluster installation. The full cluster address will be: <br />
      <strong>
        {clusterName || '[Cluster Name]'}.{baseDnsDomain || '[example.com]'}
      </strong>
    </>
  );

  const toggleRedHatDnsService = (checked: boolean) =>
    setFieldValue('baseDnsDomain', checked ? managedDomains.map((d) => d.domain)[0] : '');

  return (
    <>
      <TextContent>
        <Text component="h2">Networking</Text>
      </TextContent>
      {!!managedDomains.length && (
        <CheckboxField
          name="useRedHatDnsService"
          label="Use a temporary 60-day domain"
          helperText="A base domain will be provided for temporary, non-production clusters."
          onChange={toggleRedHatDnsService}
        />
      )}
      {values.useRedHatDnsService ? (
        <SelectField
          label="Base Domain"
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
          label="Base Domain"
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
          isChecked={!isAdvanced}
          value="basic"
          onChange={toBasic}
          label="Basic"
          description="Use default networking options."
          isLabelWrapped
        />
        <Radio
          id="networkConfigurationTypeAdvanced"
          name="networkConfigurationType"
          value="advanced"
          isChecked={isAdvanced}
          onChange={toAdvanced}
          label="Advanced"
          description="Configure a custom networking type and CIDR ranges."
          isLabelWrapped
        />
      </FormGroup>
      <BasicNetworkFields hostSubnets={hostSubnets} isAdvanced={isAdvanced} />
      {isAdvanced && <AdvancedNetworkFields />}
    </>
  );
};

export default NetworkConfiguration;
