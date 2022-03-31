import React from 'react';
import { GridItem, TextContent, Text } from '@patternfly/react-core';
import {
  Cluster,
  DetailList,
  DetailItem,
  DiskEncryption,
  PopoverIcon,
  NETWORK_TYPE_SDN,
} from '../../../common';

import {
  selectClusterNetworkCIDR,
  selectClusterNetworkHostPrefix,
  selectServiceNetworkCIDR,
} from '../../../common/selectors/clusterSelectors';
import { ClusterFeatureSupportLevelsDetailItem } from '../featureSupportLevels';

const getCpuArchTitle = () => (
  <>
    {'CPU architecture '}
    <PopoverIcon
      variant="plain"
      bodyContent={
        <p>
          The generated ISO is specific to the cluster’s CPU architecture. Only hosts with the same
          CPU architecture can be added to this cluster.
        </p>
      }
    />
  </>
);

type ClusterPropertiesProps = {
  cluster: Cluster;
};

const getNetworkType = (
  clusterNetworkType: 'OpenShiftSDN' | 'OVNKubernetes' | undefined,
): string => {
  let networkType: string;
  clusterNetworkType === NETWORK_TYPE_SDN
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
    <GridItem md={6} data-testid="cluster-details">
      <DetailList>
        <DetailItem title="Cluster ID" value={cluster.id} testId="cluster-id" />
        <DetailItem
          title="OpenShift version"
          value={cluster.openshiftVersion}
          testId="openshift-version"
        />
        <DetailItem
          title="Base DNS domain"
          value={cluster.baseDnsDomain}
          testId="base-dns-domain"
        />
        <DetailItem
          title={getCpuArchTitle()}
          value={cluster.cpuArchitecture}
          testId="cpu-architecture"
        />
        <DetailItem
          title="API virtual IP"
          value={cluster.apiVip}
          isHidden={!cluster.apiVip}
          testId="api-vip"
        />
        <DetailItem
          title="Ingress virtual IP"
          value={cluster.ingressVip}
          isHidden={!cluster.ingressVip}
          testId="ingress-vip"
        />
        <DetailItem
          title="Network management type"
          value={getManagementType(cluster.userManagedNetworking)}
          testId="network-management-type"
        />
        <DetailItem
          title="Networking Type"
          value={getNetworkType(cluster.networkType)}
          testId="networking-type"
        />
      </DetailList>
    </GridItem>
    <GridItem md={6}>
      <DetailList>
        <DetailItem
          title="Cluster network CIDR"
          value={selectClusterNetworkCIDR(cluster)}
          testId="cluster-network-cidr"
        />
        <DetailItem
          title="Cluster network host prefix"
          value={selectClusterNetworkHostPrefix(cluster)}
          testId="host-prefix"
        />
        <DetailItem
          title="Service network CIDR"
          value={selectServiceNetworkCIDR(cluster)}
          testId="service-network-cidr"
        />
        <DetailItem
          title="Disk encryption"
          value={getDiskEncryptionEnabledOnStatus(cluster.diskEncryption?.enableOn)}
          isHidden={cluster.diskEncryption?.enableOn === 'none'}
          testId="disk-encryption"
        />
        <ClusterFeatureSupportLevelsDetailItem cluster={cluster} />
      </DetailList>
    </GridItem>
  </>
);

export default ClusterProperties;
