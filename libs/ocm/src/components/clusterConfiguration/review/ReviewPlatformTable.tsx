import React from 'react';
import { Table, TableVariant, Tbody, Td, Tr } from '@patternfly/react-table';
import { genericTableRowKey } from '@openshift-assisted/common';
import { Cluster, PlatformType } from '@openshift-assisted/types/assisted-installer-service';
import { ExternalPlatformLabels } from '../platformIntegration/constants';

export const ReviewPlatformTable = ({ cluster }: { cluster: Cluster }) => {
  const rows = React.useMemo(() => {
    return [
      {
        rowId: 'platform',
        cells: [
          { title: 'Platform' },
          {
            title: ExternalPlatformLabels[cluster.platform?.type as PlatformType],
            props: { 'data-testid': 'platform-type' },
          },
        ],
      },
    ];
  }, [cluster.platform?.type]);

  return (
    <Table
      variant={TableVariant.compact}
      borders={false}
      aria-label={'Platform'}
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
