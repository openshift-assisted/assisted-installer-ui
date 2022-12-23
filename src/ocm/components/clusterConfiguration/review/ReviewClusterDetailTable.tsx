import React from 'react';
import { Table, IRow, TableVariant, TableBody } from '@patternfly/react-table';
import { Cluster, CpuArchitecture } from '../../../../common';
import useInfraEnv from '../../../hooks/useInfraEnv';
import { getDiskEncryptionEnabledOnStatus } from '../../clusterDetail/ClusterProperties';
import OpenShiftVersionDetail from '../../clusterDetail/OpenShiftVersionDetail';

export const ReviewClusterDetailTable = ({ cluster }: { cluster: Cluster }) => {
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
          { title: <>{cluster.cpuArchitecture}</>, props: { 'data-testid': 'cpu-architecture' } },
        ],
      },
      {
        cells: [
          { title: "Hosts' network configuration" },
          {
            title: <>{infraEnv?.staticNetworkConfig ? 'Static IP' : 'DHCP'}</>,
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
