import React from 'react';
import { Table, TableBody, TableVariant } from '@patternfly/react-table';
import { Cluster, Host, Inventory, stringToJSON } from '../../api';
import { getSimpleHardwareInfo } from '../hosts/hardwareInfo';
import { DetailList, DetailItem } from '../ui/DetailList';
import { ClusterValidations, HostsValidations } from './ReviewValidations';
import { fileSize } from '../hosts/utils';
import { OpenshiftVersionOptionType } from '../../types/versions';

import './ReviewCluster.css';

const ReviewHostsInventory: React.FC<{ hosts?: Host[] }> = ({ hosts = [] }) => {
  const rows = React.useMemo(() => {
    const summary = hosts
      .filter((host) => host.status !== 'disabled')
      .reduce(
        (summary, host) => {
          summary.count++;
          const inventory = stringToJSON<Inventory>(host.inventory);
          if (inventory) {
            const hwInfo = getSimpleHardwareInfo(inventory);
            summary.cores += hwInfo.cores;
            summary.memory += hwInfo.memory;
            summary.fs += hwInfo.disks;
          }
          return summary;
        },
        {
          count: 0,
          cores: 0,
          memory: 0,
          fs: 0,
        },
      );

    return [
      {
        cells: ['Hosts', summary.count],
      },
      {
        cells: ['Cores', summary.cores],
      },
      {
        cells: ['Memory', fileSize(summary.memory, 2, 'iec')],
      },
      {
        cells: ['Storage', fileSize(summary.fs, 2, 'si')],
      },
    ];
  }, [hosts]);

  return (
    <Table
      rows={rows}
      cells={['', '']}
      variant={TableVariant.compact}
      borders={false}
      aria-label="Cluster summary table"
      className="review-hosts-table"
    >
      <TableBody />
    </Table>
  );
};

type ReviewClusterProps = { cluster: Cluster; versions: OpenshiftVersionOptionType[] };

const ReviewCluster: React.FC<ReviewClusterProps> = ({ cluster, versions }) => {
  const versionLabel =
    versions.find((v) => v.value === cluster.openshiftVersion)?.label || cluster.openshiftVersion;
  return (
    <DetailList>
      <DetailItem title="Cluster address" value={`${cluster.name}.${cluster.baseDnsDomain}`} />
      <DetailItem title="OpenShift version" value={versionLabel} />
      <DetailItem title="Management network CIDR" value={cluster.clusterNetworkCidr} />
      <DetailItem title="Cluster summary" value={<ReviewHostsInventory hosts={cluster.hosts} />} />
      <DetailItem
        title="Cluster validations"
        value={<ClusterValidations validationsInfo={cluster.validationsInfo} />}
      />
      <DetailItem title="Host validations" value={<HostsValidations hosts={cluster.hosts} />} />
    </DetailList>
  );
};

export default ReviewCluster;
