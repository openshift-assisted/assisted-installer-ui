import React from 'react';
import { useFormikContext } from 'formik';
import { Checkbox, Text, TextContent } from '@patternfly/react-core';
import BasicNetworkFields from './BasicNetworkFields';
import AdvancedNetworkFields from './AdvancedNetworkFields';
import { HostSubnets, NetworkConfigurationValues } from '../../types/clusters';
import { Cluster } from '../../api/types';
import { getClusterDefaultSettings, isAdvConf } from './utils';

type NetworkConfigurationProps = {
  cluster: Cluster;
  hostSubnets: HostSubnets;
};

const NetworkConfiguration: React.FC<NetworkConfigurationProps> = ({ cluster, hostSubnets }) => {
  const { setFieldValue } = useFormikContext<NetworkConfigurationValues>();

  const [isAdvanced, setAdvanced] = React.useState(isAdvConf(cluster));

  const toggleAdvConfiguration = (checked: boolean) => {
    setAdvanced(checked);

    if (!checked) {
      const defaultSettings = getClusterDefaultSettings(cluster.clusterNetworkCidr as string);

      setFieldValue('clusterNetworkCidr', defaultSettings.clusterNetworkCidr);
      setFieldValue('serviceNetworkCidr', defaultSettings.serviceNetworkCidr);
      setFieldValue('clusterNetworkHostPrefix', defaultSettings.clusterNetworkHostPrefix);
    }
  };

  return (
    <>
      <TextContent>
        <Text component="h2">Networking</Text>
      </TextContent>
      <BasicNetworkFields cluster={cluster} hostSubnets={hostSubnets} />
      <Checkbox
        id="useAdvancedNetworking"
        label="Use Advanced Networking"
        description="Configure advanced networking properties (e.g. CIDR ranges)."
        isChecked={isAdvanced}
        onChange={toggleAdvConfiguration}
      />
      {isAdvanced && <AdvancedNetworkFields />}
    </>
  );
};

export default NetworkConfiguration;
