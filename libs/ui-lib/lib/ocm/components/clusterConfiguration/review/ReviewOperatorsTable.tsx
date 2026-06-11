import React from 'react';
import { Title } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Tr } from '@patternfly/react-table';
import { genericTableRowKey, selectOlmOperators } from '../../../../common';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { TableSummaryExpandable } from './TableSummaryExpandable';
import { useOperatorSpecs } from '../../../../common/components/operators/operatorSpecs';

const getBundleTitle = (bundleId: string) => {
  if (bundleId === 'openshift-ai') {
    return 'OpenShift AI';
  }

  if (bundleId === 'lso') {
    return 'Local Storage Operator';
  }

  return bundleId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const ReviewOperatorsTable = ({ cluster }: { cluster: Cluster }) => {
  const { byKey: opSpecs } = useOperatorSpecs();
  const selectedBundles = cluster.operatorBundles || [];
  const bundleRows = selectedBundles.map((bundle) => ({
    rowId: `bundle-${bundle.id}`,
    cells: [{ title: getBundleTitle(bundle.id), props: { 'data-testid': `bundle-${bundle.id}` } }],
  }));

  const rows = React.useMemo(
    () =>
      selectOlmOperators(cluster)
        .filter(({ name }) => !!name && !!opSpecs[name])
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
    [cluster, opSpecs],
  );

  if (!rows?.length && selectedBundles.length === 0) {
    return null;
  }

  return (
    <TableSummaryExpandable title={'Bundles and operators'} id={'operators-expandable'}>
      {bundleRows.length > 0 && (
        <>
          <Title headingLevel="h4" size="md" className="pf-v6-u-mb-sm">
            Bundles ({bundleRows.length})
          </Title>
          <Table
            variant={TableVariant.compact}
            borders={false}
            aria-label={'Bundles review table'}
            className="review-table pf-v6-u-mb-md"
          >
            <Tbody>
              {bundleRows.map((row, i) => (
                <Tr key={genericTableRowKey(row.rowId)}>
                  {row.cells.map((cell, j) => (
                    <Td key={`bundle-cell-${i}-${j}`} {...cell.props}>
                      {cell.title}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}
      {rows.length > 0 && (
        <>
          <Title headingLevel="h4" size="md" className="pf-v6-u-mb-sm">
            Operators ({rows.length})
          </Title>
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
        </>
      )}
    </TableSummaryExpandable>
  );
};
