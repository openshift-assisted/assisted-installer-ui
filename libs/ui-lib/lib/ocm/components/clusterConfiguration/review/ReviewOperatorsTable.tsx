import React from 'react';
import { Table, TableVariant, Tbody, Td, Tr } from '@patternfly/react-table';
import { genericTableRowKey } from '../../../../common';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { TableSummaryExpandable } from './TableSummaryExpandable';
import { useOperatorSpecs } from '../../../../common/components/operators/operatorSpecs';

export const ReviewOperatorsTable = ({ cluster }: { cluster: Cluster }) => {
  const { byKey: opSpecs } = useOperatorSpecs();

  const rows = React.useMemo(
    () =>
      cluster.monitoredOperators
        ?.filter(({ name }) => !!name && !!opSpecs[name])
        .map((op) => {
          const opId = op.name as string;
          return {
            rowId: `operator-${opId}`,
            cells: [
              { title: opSpecs[opId].title },
              {
                title: 'Enabled',
                props: { 'data-testid': `operator-${opId}` },
              },
            ],
          };
        }),
    [cluster.monitoredOperators, opSpecs],
  );

  if (!rows?.length) {
    return null;
  }

  return (
    <TableSummaryExpandable title={'Operators'} id={'operators-expandable'}>
      <Table
        variant={TableVariant.compact}
        borders={false}
        aria-label={'Operators review table'}
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
    </TableSummaryExpandable>
  );
};
