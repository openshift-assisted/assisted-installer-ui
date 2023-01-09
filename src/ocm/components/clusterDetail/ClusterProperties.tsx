import React from 'react';
import { GridItem, TextContent, Text } from '@patternfly/react-core';
import {
  Cluster,
  DetailList,
  DetailItem,
  DiskEncryption,
  PopoverIcon,
  NETWORK_TYPE_SDN,
  isDualStack,
  selectIpv4Cidr,
  selectIpv6Cidr,
  selectIpv4HostPrefix,
  selectIpv6HostPrefix,
  useFeatureSupportLevel,
} from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { ClusterFeatureSupportLevelsDetailItem } from '../featureSupportLevels';
import OpenShiftVersionDetail from './OpenShiftVersionDetail';

const CpuArchTitle = ({ isMultiArchSupported }: { isMultiArchSupported: boolean }) => {
  let stringCpuArch: string;
  isMultiArchSupported
    ? (stringCpuArch =
        'The original cluster hosts CPU architecture. You can add hosts that are using either x86 or arm64 CPU architecture to this cluster.')
    : (stringCpuArch = 'The original cluster hosts CPU architecture.');
  return (
    <>
      {'CPU architecture '}
      <PopoverIcon bodyContent={<p>{stringCpuArch}</p>} />
    </>
  );
};

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
  const featureSupportLevelContext = useFeatureSupportLevel();

  const isMultiArchSupported = Boolean(
    cluster.cpuArchitecture === 'multi' ||
      (cluster.openshiftVersion &&
        featureSupportLevelContext.getFeatureSupportLevel(
          cluster.openshiftVersion,
          'MULTIARCH_RELEASE_IMAGE',
        ) === 'supported'),
  );
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
          {externalMode ? undefined : <OpenShiftVersionDetail cluster={cluster} />}
          <DetailItem title="Base domain" value={cluster.baseDnsDomain} testId="base-dns-domain" />
          <DetailItem
            title={<CpuArchTitle isMultiArchSupported={isMultiArchSupported} />}
            value={
              cluster.cpuArchitecture === 'multi'
                ? 'Multiple CPU architectures'
                : cluster.cpuArchitecture
            }
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
