import React from 'react';
import { IRow, Table, TableBody, TableVariant } from '@patternfly/react-table';
import { Cluster, CpuArchitecture, useFeatureSupportLevel } from '../../../../common';
import { getDiskEncryptionEnabledOnStatus } from '../../clusterDetail/ClusterProperties';
import OpenShiftVersionDetail from '../../clusterDetail/OpenShiftVersionDetail';

export const ReviewClusterDetailTable = ({ cluster }: { cluster: Cluster }) => {
  const { activeFeatureConfiguration } = useFeatureSupportLevel();

  const rows = React.useMemo(() => {
    const cpuArchitecture =
      activeFeatureConfiguration?.underlyingCpuArchitecture || CpuArchitecture.x86;
    const hasStaticIp = activeFeatureConfiguration?.hasStaticIpNetworking || false;
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
            title: <>{cpuArchitecture}</>,
            props: { 'data-testid': 'cpu-architecture' },
          },
        ],
      },
      {
        cells: [
          { title: "Hosts' network configuration" },
          {
            title: <>{hasStaticIp ? 'Static IP' : 'DHCP'}</>,
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
      aria-label={'Cluster details review table'}
      className="review-table"
    >
      <TableBody />
    </Table>
  );
};
