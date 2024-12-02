import React from 'react';
import { Table, TableVariant, Tbody, Td, Tr } from '@patternfly/react-table';
import {
  ExposedOperatorNames,
  hasEnabledOperators,
  genericTableRowKey,
  operatorLabels,
} from '../../../../common';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

export const ReviewOperatorsTable = ({ cluster }: { cluster: Cluster }) => {
  const { t } = useTranslation();
  const featureSupportLevel = useNewFeatureSupportLevel();
  const operatorNames = operatorLabels(t, featureSupportLevel);

  const rows = React.useMemo(() => {
    return ExposedOperatorNames.filter((operator) =>
      hasEnabledOperators(cluster.monitoredOperators, operator),
    ).map((operator) => ({
      rowId: `operator-${operator}`,
      cells: [
        { title: operatorNames[operator] },
        {
          title: 'Enabled',
          props: { 'data-testid': `operator-${operator}` },
        },
      ],
    }));
  }, [cluster.monitoredOperators, operatorNames]);

  return (
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
  );
};
