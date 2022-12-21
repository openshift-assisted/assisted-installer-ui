import React from 'react';
import { Table, IRow, TableVariant, TableBody } from '@patternfly/react-table';
import { Cluster } from '../../../../common';
import useInfraEnv from '../../../hooks/useInfraEnv';
import { getDiskEncryptionEnabledOnStatus } from '../../clusterDetail/ClusterProperties';
import OpenShiftVersionDetail from '../../clusterDetail/OpenShiftVersionDetail';

export const ReviewClusterDetailTable = ({ cluster }: { cluster: Cluster }) => {
  const { infraEnv } = useInfraEnv(cluster.id, cluster.cpuArchitecture);

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
      cluster.diskEncryption?.enableOn !== 'none' && {
        cells: [
          { title: 'Disk encryption' },
          {
            title: getDiskEncryptionEnabledOnStatus(cluster.diskEncryption?.enableOn),
            props: { 'data-testId': 'disk-encryption' },
          },
        ],
      },
    ];
  }, [cluster, infraEnv?.staticNetworkConfig]);

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
