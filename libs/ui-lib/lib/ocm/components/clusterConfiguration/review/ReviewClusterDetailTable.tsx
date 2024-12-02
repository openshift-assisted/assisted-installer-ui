import React from 'react';
import { Table, TableVariant, Tbody, Td, Tr } from '@patternfly/react-table';
import { genericTableRowKey, getDefaultCpuArchitecture } from '../../../../common';
import { getDiskEncryptionEnabledOnStatus } from '../../clusterDetail/ClusterProperties';
import OpenShiftVersionDetail from '../../clusterDetail/OpenShiftVersionDetail';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

export const ReviewClusterDetailTable = ({ cluster }: { cluster: Cluster }) => {
  const { activeFeatureConfiguration } = useNewFeatureSupportLevel();

  const rows = React.useMemo(() => {
    const cpuArchitecture =
      activeFeatureConfiguration?.underlyingCpuArchitecture || getDefaultCpuArchitecture();
    const hasStaticIp = activeFeatureConfiguration?.hasStaticIpNetworking || false;

    const rows = [
      {
        rowId: 'address',
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
        rowId: 'version',
        cells: [
          { title: 'OpenShift version' },
          {
            title: <OpenShiftVersionDetail cluster={cluster} />,
            props: { 'data-testid': 'openshift-version' },
          },
        ],
      },
      {
        rowId: 'cpuArchitecture',
        cells: [
          { title: 'CPU architecture' },
          {
            title: <>{cpuArchitecture}</>,
            props: { 'data-testid': 'cpu-architecture' },
          },
        ],
      },
      {
        rowId: 'hostNetwork',

        cells: [
          { title: "Hosts' network configuration" },
          {
            title: <>{hasStaticIp ? 'Static IP' : 'DHCP'}</>,
            props: { 'data-testid': 'network-configuration' },
          },
        ],
      },
    ];

    const diskEncryptionTitle = getDiskEncryptionEnabledOnStatus(cluster.diskEncryption?.enableOn);
    if (diskEncryptionTitle) {
      rows.push({
        rowId: 'diskEncryption',
        cells: [
          { title: 'Disk encryption' },
          {
            title: diskEncryptionTitle,
            props: { 'data-testid': 'disk-encryption' },
          },
        ],
      });
    }
    return rows;
  }, [cluster, activeFeatureConfiguration]);

  return (
    <Table
      variant={TableVariant.compact}
      borders={false}
      aria-label={'Cluster details review table'}
      className="review-table"
    >
      <Tbody>
        {rows.map((row, i) => (
          <Tr key={genericTableRowKey(row.rowId)}>
            {row.cells.map((cell, j) => (
              <Td key={`cell-${i}-${j}`} {...cell.props}>
                {cell.title}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
