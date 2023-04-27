import React from 'react';
import { GridItem, Text, TextContent } from '@patternfly/react-core';
import {
  Cluster,
  DetailItem,
  DetailList,
  DiskEncryption,
  getDefaultCpuArchitecture,
  isDualStack,
  NETWORK_TYPE_SDN,
  selectIpv4Cidr,
  selectIpv4HostPrefix,
  selectIpv6Cidr,
  selectIpv6HostPrefix,
} from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { ClusterFeatureSupportLevelsDetailItem } from '../featureSupportLevels';
import OpenShiftVersionDetail from './OpenShiftVersionDetail';
import { useNewFeatureSupportLevel } from '../../../common/components/newFeatureSupportLevels';

type ClusterPropertiesProps = {
  cluster: Cluster;
  externalMode?: boolean;
};

export const getNetworkType = (clusterNetworkType: Cluster['networkType']): string => {
  let networkType: string;
  clusterNetworkType === NETWORK_TYPE_SDN
    ? (networkType = 'Software-Defined Networking (SDN)')
    : (networkType = 'Open Virtual Network (OVN)');
  return networkType;
};

export const getManagementType = ({ userManagedNetworking }: Cluster): string => {
  let managementType: string;
  userManagedNetworking
    ? (managementType = 'User-Managed Networking')
    : (managementType = 'Cluster-managed networking');
  return managementType;
};

export const getStackTypeLabel = (cluster: Cluster): string =>
  isDualStack(cluster) ? 'Dual-stack' : 'IPv4';

export const getDiskEncryptionEnabledOnStatus = (diskEncryption: DiskEncryption['enableOn']) => {
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

const ClusterProperties = ({ cluster, externalMode = false }: ClusterPropertiesProps) => {
  const { t } = useTranslation();
  const isDualStackType = isDualStack(cluster);
  const featureSupportLevelContext = useNewFeatureSupportLevel();

  const activeFeatureConfiguration = featureSupportLevelContext.activeFeatureConfiguration;
  const underlyingCpuArchitecture =
    activeFeatureConfiguration?.underlyingCpuArchitecture || getDefaultCpuArchitecture();

  return (
    <>
      {!externalMode && (
        <GridItem>
          <TextContent>
            <Text component="h2">{t('ai:Cluster Details')}</Text>
          </TextContent>
        </GridItem>
      )}
      <GridItem md={6} data-testid="cluster-details">
        <DetailList>
          {externalMode ? undefined : (
            <DetailItem
              title={t('ai:OpenShift version')}
              value={<OpenShiftVersionDetail cluster={cluster} />}
              testId="openshift-version"
            />
          )}
          <DetailItem title="Base domain" value={cluster.baseDnsDomain} testId="base-dns-domain" />
          <DetailItem
            title={'CPU architecture '}
            value={underlyingCpuArchitecture}
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
            value={getManagementType(cluster)}
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
            value={selectIpv4Cidr(cluster, 'clusterNetworks')}
            testId="cluster-network-cidr-ipv4"
          />
          <DetailItem
            title="Cluster network host prefix (IPv4)"
            value={selectIpv4HostPrefix(cluster)}
            testId="host-prefix-ipv4"
          />
          {isDualStackType ? (
            <>
              <DetailItem
                title="Cluster network CIDR (IPv6)"
                value={selectIpv6Cidr(cluster, 'clusterNetworks')}
                testId="cluster-network-cidr-ipv6"
              />
              <DetailItem
                title="Cluster network host prefix (IPv6)"
                value={selectIpv6HostPrefix(cluster)}
                testId="host-prefix-ipv6"
              />
            </>
          ) : undefined}
          <DetailItem
            title="Service network CIDR (IPv4)"
            value={selectIpv4Cidr(cluster, 'serviceNetworks')}
            testId="service-network-cidr-ipv4"
          />
          {isDualStackType ? (
            <DetailItem
              title="Service network CIDR (IPv6)"
              value={selectIpv6Cidr(cluster, 'serviceNetworks')}
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
