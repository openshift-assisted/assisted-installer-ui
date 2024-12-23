import * as React from 'react';
import { Table, TableVariant, Tbody, Td, Tr } from '@patternfly/react-table';
import type { Inventory, Host } from '@openshift-assisted/types/assisted-installer-service';
import { getEnabledHosts } from '../hosts';
import { getSimpleHardwareInfo } from '../hosts/hardwareInfo';
import { fileSize, stringToJSON } from '../../utils';
import { genericTableRowKey } from '../ui';

const ReviewHostsInventory = ({ hosts = [] }: { hosts?: Host[] }) => {
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
        cells: [{ title: 'Hosts' }, { title: summary.count }],
        rowId: 'hosts',
      },
      {
        cells: [{ title: 'Total cores' }, { title: summary.cores }],
        rowId: 'total-cores',
      },
      {
        cells: [{ title: 'Total memory' }, { title: fileSize(summary.memory, 2, 'iec') }],
        rowId: 'total-memory',
      },
      {
        cells: [{ title: 'Total storage' }, { title: fileSize(summary.fs, 2, 'si') }],
        rowId: 'total-storage',
      },
    ];
  }, [hosts]);

  return (
    <Table
      data-testid="review-host-inventory-table"
      variant={TableVariant.compact}
      borders={false}
      aria-label="Cluster summary table"
      className="review-table"
    >
      <Tbody>
        {rows.map((row, i) => (
          <Tr key={genericTableRowKey(row.rowId)}>
            {row.cells.map((cell, j) => (
              <Td key={`cell-${i}-${j}`}>{cell.title}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default ReviewHostsInventory;
