import React from 'react';
import { ExpandableSection, Title } from '@patternfly/react-core';
import { Table, TableVariant, TableBody } from '@patternfly/react-table';
import {
  Cluster,
  CpuArchitecture,
  hasEnabledOperators,
  isDualStack,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_ODF,
  ReviewHostsInventory,
} from '../../../../common';
import useInfraEnv from '../../../hooks/useInfraEnv';
import {
  getManagementType,
  getNetworkType,
  getStackType,
} from '../../clusterDetail/ClusterProperties';
import OpenShiftVersionDetail from '../../clusterDetail/OpenShiftVersionDetail';

const ClusterSummaryExpandable = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode | undefined;
}) => {
  const [isExpanded, setExpanded] = React.useState(true);
  return (
    <ExpandableSection
      toggleContent={<b>{title}</b>}
      isExpanded={isExpanded}
      onToggle={() => setExpanded(!isExpanded)}
      isIndented
    >
      {children}
      <br />
    </ExpandableSection>
  );
};

const ReviewClusterDetailTable = ({ cluster }: { cluster: Cluster }) => {
  const { infraEnv } = useInfraEnv(cluster.id, cluster.cpuArchitecture as CpuArchitecture);

  const rows = React.useMemo(() => {
    return [
      {
        cells: [
          { title: 'Cluster address' },
          {
            title: (
              <>
                {cluster.name || ''}
                {'.'}
                {cluster.baseDnsDomain || ''}
              </>
            ),
            props: { 'data-testId': 'cluster-address' },
          },
        ],
      },
      {
        cells: [
          { title: 'OpenShift version' },
          {
            title: <OpenShiftVersionDetail cluster={cluster} />,
            props: { 'data-testId': 'openshift-version' },
          },
        ],
      },
      {
        cells: [
          { title: 'CPU architecture' },
          { title: <>{cluster.cpuArchitecture}</>, props: { 'data-testId': 'cpu-architecture' } },
        ],
      },
      {
        cells: [
          { title: "Hosts' network configuration" },
          {
            title: <>{infraEnv?.staticNetworkConfig ? 'Static IP' : 'DHCP'}</>,
            props: { 'data-testId': 'network-configuration' },
          },
        ],
      },
      // cluster.diskEncryption?.enableOn !== 'none' && {
      //   cells: [
      //     { title: 'Disk encryption' },
      //     {
      //       title: (
      //         <>{getDiskEncryptionEnabledOnStatus(cluster.diskEncryption?.enableOn) || 'None'}</>
      //       ),
      //       props: { 'data-testId': 'disk-encryption' },
      //     },
      //   ],
      // },
    ];
  }, [cluster, infraEnv?.staticNetworkConfig]);

  return (
    <Table
      rows={rows}
      cells={['', '']}
      variant={TableVariant.compact}
      borders={false}
      className="review-table"
    >
      <TableBody />
    </Table>
  );
};

const ReviewStorageTable = ({ cluster }: { cluster: Cluster }) => {
  const rows = React.useMemo(() => {
    return [
      {
        cells: [
          'OpenShift Virtualization',
          {
            title: hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_CNV)
              ? 'Enabled'
              : 'Disabled',
            props: { 'data-testId': 'openshift-virtualization' },
          },
        ],
      },
      {
        cells: [
          'OpenShift Data Foundation',
          {
            title: hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_ODF)
              ? 'Enabled'
              : 'Disabled',
            props: { 'data-testId': 'openshift-container-storage' },
          },
        ],
      },
    ];
  }, [cluster]);

  return (
    <Table
      rows={rows}
      cells={['', '']}
      variant={TableVariant.compact}
      borders={false}
      className="review-table"
    >
      <TableBody />
    </Table>
  );
};

const ReviewNetworkingTable = ({ cluster }: { cluster: Cluster }) => {
  const rows = React.useMemo(() => {
    return [
      {
        cells: [
          { title: 'Networking management type' },
          {
            title: getManagementType(cluster),
            props: { 'data-testId': 'networking-management-type', colSpan: 2 },
          },
        ],
      },
      {
        cells: [
          { title: 'Stack type', colSpan: 2 },
          {
            title: getStackType(cluster),
            props: { 'data-testId': 'stack-type', colSpan: 2 },
          },
        ],
      },
      {
        cells: [
          { title: 'Machine networks CIDR' },
          {
            title: cluster.machineNetworks?.map((network) => (
              <span key={network.cidr}>
                {network.cidr}
                <br />
              </span>
            )),
            props: { 'data-testId': 'machine-networks' },
          },
          isDualStack(cluster) && { title: 'Primary' },
        ],
      },
      {
        cells: [
          { title: 'API Virtual IP' },
          {
            title: cluster.apiVip,
            props: { 'data-testId': 'api-vip', colSpan: 2 },
          },
        ],
      },
      {
        cells: [
          { title: 'Ingress Virtual IP' },
          {
            title: cluster.ingressVip,
            props: { 'data-testId': 'ingress-vip', colSpan: 2 },
          },
        ],
      },
    ];
  }, [cluster]);

  const rowsAdvanced = React.useMemo(() => {
    return [
      {
        cells: [
          'Cluster network CIDR',
          {
            title: cluster.clusterNetworks?.map((network) => (
              <span key={network.cidr}>
                {network.cidr}
                <br />
              </span>
            )),
            props: { 'data-testId': 'cluster-network-cidr' },
          },
          isDualStack(cluster) && { title: 'Primary' },
        ],
      },
      {
        cells: [
          'Cluster network host prefix',
          {
            title: cluster.clusterNetworks?.map((network) => (
              <span key={network.hostPrefix}>
                {network.hostPrefix}
                <br />
              </span>
            )),
            props: { 'data-testId': 'cluster-network-prefix' },
          },
          isDualStack(cluster) && { title: 'Primary' },
        ],
      },
      {
        cells: [
          'Service network CIDR',
          {
            title: cluster.serviceNetworks?.map((network) => (
              <span key={network.cidr}>
                {network.cidr}
                <br />
              </span>
            )),
            props: { 'data-testId': 'service-network-cidr' },
          },
          isDualStack(cluster) && { title: 'Primary' },
        ],
      },
      {
        cells: [
          'Networking type',
          {
            title: getNetworkType(cluster.networkType),
            props: { 'data-testId': 'networking-type', colSpan: 2 },
          },
        ],
      },
    ];
  }, [cluster]);

  return (
    <>
      <Table
        rows={rows}
        cells={['', '', '']}
        variant={TableVariant.compact}
        borders={false}
        className={'review-table'}
      >
        <TableBody />
      </Table>

      <br />
      <Title className="pf-u-color-400" headingLevel="h4">
        Advanced networking settings
      </Title>

      <Table
        rows={rowsAdvanced}
        cells={['', '', '']}
        variant={TableVariant.compact}
        borders={false}
        className={'review-table'}
      >
        <TableBody />
      </Table>
    </>
  );
};

export const ReviewSummary = ({ cluster }: { cluster: Cluster }) => {
  return (
    <ExpandableSection
      toggleText={'Cluster summary'}
      className={'summary-expandable'}
      isIndented
      isExpanded
    >
      <ClusterSummaryExpandable title={'Cluster details'}>
        <ReviewClusterDetailTable cluster={cluster} />
      </ClusterSummaryExpandable>

      <ClusterSummaryExpandable title={'Storage'}>
        <ReviewStorageTable cluster={cluster} />
      </ClusterSummaryExpandable>

      <ClusterSummaryExpandable title={'Inventory'}>
        <ReviewHostsInventory hosts={cluster.hosts} />
      </ClusterSummaryExpandable>

      <ClusterSummaryExpandable title={'Networking'}>
        <ReviewNetworkingTable cluster={cluster} />
      </ClusterSummaryExpandable>
    </ExpandableSection>
  );
};
