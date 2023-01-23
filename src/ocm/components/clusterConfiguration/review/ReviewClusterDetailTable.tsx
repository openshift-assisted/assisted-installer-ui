import React from 'react';
import { Table, IRow, TableVariant, TableBody } from '@patternfly/react-table';
import { Cluster, useFeatureSupportLevel } from '../../../../common';
import { getDiskEncryptionEnabledOnStatus } from '../../clusterDetail/ClusterProperties';
import OpenShiftVersionDetail from '../../clusterDetail/OpenShiftVersionDetail';

export const ReviewClusterDetailTable = ({ cluster }: { cluster: Cluster }) => {
  const { activeFeatureConfiguration } = useFeatureSupportLevel();

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
            props: { 'data-testid': 'cluster-address' },
          },
        ],
      },
      {
        cells: [
          { title: 'OpenShift version' },
          {
            title: <OpenShiftVersionDetail cluster={cluster} />,
            props: { 'data-testid': 'openshift-version' },
          },
        ],
      },
      {
        cells: [
          { title: 'CPU architecture' },
          {
            title: <>{activeFeatureConfiguration.underlyingCpuArchitecture}</>,
            props: { 'data-testid': 'cpu-architecture' },
          },
        ],
      },
      {
        cells: [
          { title: "Hosts' network configuration" },
          {
            title: <>{activeFeatureConfiguration.hasStaticIpNetworking ? 'Static IP' : 'DHCP'}</>,
            props: { 'data-testid': 'network-configuration' },
          },
        ],
      },
      cluster.diskEncryption?.enableOn !== 'none' && {
        cells: [
          { title: 'Disk encryption' },
          {
            title: getDiskEncryptionEnabledOnStatus(cluster.diskEncryption?.enableOn),
            props: { 'data-testid': 'disk-encryption' },
          },
        ],
      },
    ];
  }, [cluster, activeFeatureConfiguration]);

  return (
    <Table
      rows={rows as IRow[]}
      cells={['', '']}
      variant={TableVariant.compact}
      borders={false}
      className="review-table"
    >
      <TableBody />
    </Table>
  );
};
