import React from 'react';
import { useFormikContext } from 'formik';
import { Checkbox } from '@patternfly/react-core';
import BasicNetworkFields from './BasicNetworkFields';
import AdvancedNetworkFields from './AdvancedNetworkFields';
import { HostSubnets, NetworkConfigurationValues } from '../../types/clusters';
import { getClusterDefaultSettings, isAdvConf, isSingleNodeCluster } from './utils';
import { Cluster } from '../../api/types';

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
      {!isSingleNodeCluster(cluster) && (
        <BasicNetworkFields cluster={cluster} hostSubnets={hostSubnets} />
      )}
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
