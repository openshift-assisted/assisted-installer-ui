import React from 'react';
import { Table, TableBody, TableHeader, TableVariant } from '@patternfly/react-table';
import Humanize from 'humanize-plus';
import { Cluster, Host, Inventory, stringToJSON } from '../../api';
import { getSimpleHardwareInfo } from '../hosts/hardwareInfo';
import { DetailList, DetailItem } from '../ui/DetailList';

// DO NOT MERGE: https://marvelapp.com/prototype/7ce7ib3/screen/73292721
const ReviewHostsInventoryColumns = ['Role', 'CPU', 'Memory', 'Filesystem'];

const ReviewHostsInventory: React.FC<{ hosts?: Host[] }> = ({ hosts = [] }) => {
  const rows = React.useMemo(() => {
    const summary = {
      master: {
        count: 0,
        cores: 0,
        memory: 0,
        fs: 0,
      },
      worker: {
        count: 0,
        cores: 0,
        memory: 0,
        fs: 0,
      },
    };

    hosts.forEach((host) => {
      // TODO(mlibra): auto-assign role
      let summaryGroup = summary.worker;
      if (host.role === 'master') {
        summaryGroup = summary.master;
      }

      summaryGroup.count++;
      const inventory = stringToJSON<Inventory>(host.inventory);
      if (inventory) {
        const hwInfo = getSimpleHardwareInfo(inventory);
        summaryGroup.cores += hwInfo.cores;
        summaryGroup.memory += hwInfo.memory;
        summaryGroup.fs += hwInfo.disks;
      }
    });

    return [
      {
        cells: [
          `${summary.master.count} master${summary.master.count === 1 ? '' : 's'}`,
          `${summary.master.cores} cores`,
          Humanize.fileSize(summary.master.memory),
          Humanize.fileSize(summary.master.fs),
        ],
      },
      {
        cells: [
          `${summary.worker.count} worker${summary.worker.count === 1 ? '' : 's'}`,
          `${summary.worker.cores} cores`,
          Humanize.fileSize(summary.worker.memory),
          Humanize.fileSize(summary.worker.fs),
        ],
      },
    ];
  }, [hosts]);

  return (
    <Table
      rows={rows}
      cells={ReviewHostsInventoryColumns}
      variant={TableVariant.compact}
      borders={false}
      aria-label="Hosts summary table"
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};

const ReviewCluster: React.FC<{ cluster: Cluster }> = ({ cluster }) => (
  <DetailList>
    <DetailItem title="Cluster address" value={`${cluster.name}.${cluster.baseDnsDomain}`} />
    <DetailItem title="OpenShift version" value={cluster.openshiftVersion} />
    <DetailItem title="Management network CIDR" value={cluster.clusterNetworkCidr} />
    <DetailItem
      title="Bare metal inventory"
      value={<ReviewHostsInventory hosts={cluster.hosts} />}
    />
  </DetailList>
);

export default ReviewCluster;
