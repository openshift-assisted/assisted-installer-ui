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
  isIPv4,
  selectIpv4Cidr,
  selectIpv6Cidr,
  selectIpv4HostPrefix,
  selectIpv6HostPrefix,
} from '../../../common/selectors/clusterSelectors';
import { ClusterFeatureSupportLevelsDetailItem } from '../featureSupportLevels';

const getCpuArchTitle = () => (
  <>
    {'CPU architecture '}
    <PopoverIcon
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
  externalMode?: boolean;
};

const getNetworkType = (clusterNetworkType: Cluster['networkType']): string => {
  let networkType: string;
  clusterNetworkType === NETWORK_TYPE_SDN
    ? (networkType = 'Software-Defined Networking (SDN)')
    : (networkType = 'Open Virtual Network (OVN)');
  return networkType;
};

const getManagementType = (isUserManagementType: boolean | undefined): string => {
  let managementType: string;
  isUserManagementType
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

const ClusterProperties: React.FC<ClusterPropertiesProps> = ({ cluster, externalMode = false }) => {
  const isDualstack =
    !isIPv4(cluster) &&
    cluster.clusterNetworks &&
    cluster.clusterNetworks.length > 1 &&
    cluster.serviceNetworks &&
    cluster.serviceNetworks.length > 1;

  return (
    <>
      {!externalMode && (
        <GridItem>
          <TextContent>
            <Text component="h2">Cluster Details</Text>
          </TextContent>
        </GridItem>
      )}
      <GridItem md={6} data-testid="cluster-details">
        <DetailList>
          {externalMode ? undefined : (
            <DetailItem
              title="OpenShift version"
              value={cluster.openshiftVersion}
              testId="openshift-version"
            />
          )}

          <DetailItem title="Base domain" value={cluster.baseDnsDomain} testId="base-dns-domain" />
          <DetailItem
            title={getCpuArchTitle()}
            value={cluster.cpuArchitecture}
            testId="cpu-architecture"
          />
          <DetailItem
            title="API IP"
            value={cluster.apiVip}
            isHidden={!cluster.apiVip}
            testId="api-vip"
          />
          <DetailItem
            title="Ingress IP"
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
            title="Cluster network CIDR (IPv4)"
            value={selectIpv4Cidr(cluster.clusterNetworks || [])}
            testId="cluster-network-cidr-ipv4"
          />
          <DetailItem
            title="Cluster network host prefix (IPv4)"
            value={selectIpv4HostPrefix(cluster.clusterNetworks || [])}
            testId="host-prefix-ipv4"
          />
          {isDualstack ? (
            <>
              <DetailItem
                title="Cluster network CIDR (IPv6)"
                value={selectIpv6Cidr(cluster.clusterNetworks || [])}
                testId="cluster-network-cidr-ipv6"
              />
              <DetailItem
                title="Cluster network host prefix (IPv6)"
                value={selectIpv6HostPrefix(cluster.clusterNetworks || [])}
                testId="host-prefix-ipv6"
              />
            </>
          ) : undefined}
          <DetailItem
            title="Service network CIDR (IPv4)"
            value={selectIpv4Cidr(cluster.serviceNetworks || [])}
            testId="service-network-cidr-ipv4"
          />
          {isDualstack ? (
            <DetailItem
              title="Service network CIDR (IPv6)"
              value={selectIpv6Cidr(cluster.serviceNetworks || [])}
              testId="service-network-cidr-ipv6"
            />
          ) : undefined}
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
};

export default ClusterProperties;
