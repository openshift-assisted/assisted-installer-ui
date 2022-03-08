import { Table, TableBody, TableVariant } from '@patternfly/react-table';
import * as React from 'react';
import { stringToJSON, Inventory, Host } from '../../api';
import { getEnabledHosts, fileSize } from '../hosts';
import { getSimpleHardwareInfo } from '../hosts/hardwareInfo';

const ReviewHostsInventory: React.FC<{ hosts?: Host[] }> = ({ hosts = [] }) => {
  const rows = React.useMemo(() => {
    const summary = getEnabledHosts(hosts).reduce(
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

export default ReviewHostsInventory;
