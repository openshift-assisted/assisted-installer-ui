import React from 'react';
import { useFormikContext } from 'formik';
import { TextContent, Text, Checkbox } from '@patternfly/react-core';
import BasicNetworkFields from './BasicNetworkFields';
import AdvancedNetworkFields from './AdvancedNetworkFields';
import { HostSubnets, ClusterConfigurationValues } from '../../types/clusters';
import { InputField, CheckboxField, SelectField } from '../ui/formik';
import { ManagedDomain, Cluster } from '../../api/types';
import { CLUSTER_DEFAULT_NETWORK_SETTINGS } from '../../config/constants';
import { isAdvConf } from './utils';

type NetworkConfigurationProps = {
  cluster: Cluster;
  hostSubnets: HostSubnets;
  managedDomains: ManagedDomain[];
};

const NetworkConfiguration: React.FC<NetworkConfigurationProps> = ({
  cluster,
  hostSubnets,
  managedDomains,
}) => {
  const { setFieldValue, values } = useFormikContext<ClusterConfigurationValues>();
  const { name: clusterName, baseDnsDomain, useRedHatDnsService } = values;

  const [isAdvanced, setAdvanced] = React.useState(isAdvConf(cluster));

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

  const toggleAdvConfiguration = (checked: boolean) => {
    setAdvanced(checked);

    if (!checked) {
      setFieldValue('clusterNetworkCidr', CLUSTER_DEFAULT_NETWORK_SETTINGS.clusterNetworkCidr);
      setFieldValue(
        'clusterNetworkHostPrefix',
        CLUSTER_DEFAULT_NETWORK_SETTINGS.clusterNetworkHostPrefix,
      );
      setFieldValue('serviceNetworkCidr', CLUSTER_DEFAULT_NETWORK_SETTINGS.serviceNetworkCidr);
      setFieldValue('ntpSource', CLUSTER_DEFAULT_NETWORK_SETTINGS.ntpSource);
    }
  };

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
      <BasicNetworkFields cluster={cluster} hostSubnets={hostSubnets} />
      <Checkbox
        id="useAdvancedNetworking"
        label="Use Advanced Networking"
        description="Configure advanced networking properties (CIDR ranges, NTP)."
        isChecked={isAdvanced}
        onChange={toggleAdvConfiguration}
      />
      {isAdvanced && <AdvancedNetworkFields />}
    </>
  );
};

export default NetworkConfiguration;
