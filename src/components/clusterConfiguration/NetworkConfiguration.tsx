import React from 'react';
import { useFormikContext } from 'formik';
import { Checkbox } from '@patternfly/react-core';
import BasicNetworkFields from './BasicNetworkFields';
import AdvancedNetworkFields from './AdvancedNetworkFields';
import { HostSubnets, NetworkConfigurationValues } from '../../types/clusters';
import { Cluster } from '../../api/types';
import { isSingleNodeCluster } from '../clusters/utils';
import { isAdvConf } from './utils';
import { useDefaultConfiguration } from './ClusterDefaultConfigurationContext';

type NetworkConfigurationProps = {
  cluster: Cluster;
  hostSubnets: HostSubnets;
};

const NetworkConfiguration: React.FC<NetworkConfigurationProps> = ({ cluster, hostSubnets }) => {
  const { setFieldValue } = useFormikContext<NetworkConfigurationValues>();
  const defaultNetworkSettings = useDefaultConfiguration([
    'clusterNetworkCidr',
    'serviceNetworkCidr',
    'clusterNetworkHostPrefix',
  ]);

  const [isAdvanced, setAdvanced] = React.useState(isAdvConf(cluster, defaultNetworkSettings));

  const toggleAdvConfiguration = (checked: boolean) => {
    setAdvanced(checked);

    if (!checked) {
      setFieldValue('clusterNetworkCidr', defaultNetworkSettings.clusterNetworkCidr);
      setFieldValue('serviceNetworkCidr', defaultNetworkSettings.serviceNetworkCidr);
      setFieldValue('clusterNetworkHostPrefix', defaultNetworkSettings.clusterNetworkHostPrefix);
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
