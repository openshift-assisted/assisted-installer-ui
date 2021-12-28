import React from 'react';
import { GridItem, TextContent, Text } from '@patternfly/react-core';
import {
  Cluster,
  isSingleNodeCluster,
  DetailList,
  DetailItem,
  DiskEncryption,
} from '../../../common';
import {
  selectClusterNetworkCIDR,
  selectClusterNetworkHostPrefix,
  selectServiceNetworkCIDR,
} from '../../selectors/clusterSelectors';

type ClusterPropertiesProps = {
  cluster: Cluster;
};

const getNetworkType = (
  clusterNetworkType: 'OpenShiftSDN' | 'OVNKubernetes' | undefined,
): string => {
  let networkType: string;
  clusterNetworkType == 'OpenShiftSDN'
    ? (networkType = 'Software-Defined Networking (SDN)')
    : (networkType = 'Open Virtual Network (OVN)');
  return networkType;
};

const getManagementType = (clusterManagementType: boolean | undefined): string => {
  let managementType: string;
  clusterManagementType
    ? (managementType = 'User-Managed Networking')
    : (managementType = 'Cluster-managed networking');
  return managementType;
};

const getDiskEncryptionEnabledOnStatus = (diskEncryption: DiskEncryption['enableOn']) => {
  let diskEncryptionType = null;
  switch (diskEncryption) {
    case 'all':
      diskEncryptionType = (
        <>
          Enabled on control plane nodes
          <br />
          Enabled on workers
        </>
      );
      break;
    case 'masters':
      diskEncryptionType = <>Enabled on control plane nodes</>;
      break;
    case 'workers':
      diskEncryptionType = <>Enabled on workers</>;
      break;
  }
  return diskEncryptionType;
};

const ClusterProperties: React.FC<ClusterPropertiesProps> = ({ cluster }) => (
  <>
    <GridItem>
      <TextContent>
        <Text component="h2">Cluster Details</Text>
      </TextContent>
    </GridItem>
    <GridItem md={6}>
      <DetailList>
        <DetailItem title="OpenShift version" value={cluster.openshiftVersion} />
        <DetailItem title="Base DNS domain" value={cluster.baseDnsDomain} />
        <DetailItem
          title="API virtual IP"
          value={cluster.apiVip}
          isHidden={!cluster.apiVip}
        />
        <DetailItem
          title="Ingress virtual IP"
          value={cluster.ingressVip}
          isHidden={!cluster.ingressVip}
        />
        <DetailItem
          title="Disk encryption"
          value={getDiskEncryptionEnabledOnStatus(cluster.diskEncryption?.enableOn)}
          isHidden={cluster.diskEncryption?.enableOn === 'none'}
        />
      </DetailList>
    </GridItem>
    <GridItem md={6}>
      <DetailList>
        <DetailItem title="UUID" value={cluster.id} />
        <DetailItem title="Cluster network CIDR" value={selectClusterNetworkCIDR(cluster)} />
        <DetailItem
          title="Cluster network host prefix"
          value={selectClusterNetworkHostPrefix(cluster)}
        />
        <DetailItem title="Service network CIDR" value={selectServiceNetworkCIDR(cluster)} />
        <DetailItem
          title="Network management type"
          value={getManagementType(cluster.userManagedNetworking)}
        />
        <DetailItem title="Networking Type" value={getNetworkType(cluster.networkType)} />
      </DetailList>
    </GridItem>
  </>
);

export default ClusterProperties;
