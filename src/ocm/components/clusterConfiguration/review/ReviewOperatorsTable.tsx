import React from 'react';
import { Table, TableVariant, TableBody, IRow } from '@patternfly/react-table';
import {
  Cluster,
  hasEnabledOperators,
  operatorLabels,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_LVM,
  OPERATOR_NAME_ODF,
} from '../../../../common';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';

export const ReviewOperatorsTable = ({ cluster }: { cluster: Cluster }) => {
  const { t } = useTranslation();
  const operatorNames = operatorLabels(t);

  const operators = React.useMemo(
    () => [OPERATOR_NAME_CNV, OPERATOR_NAME_ODF, OPERATOR_NAME_LVM],
    [],
  );

  const rows = React.useMemo(() => {
    return operators
      .filter((operator) => hasEnabledOperators(cluster.monitoredOperators, operator))
      .map((operator) => ({
        cells: [
          operatorNames[operator],
          {
            title: 'Enabled',
            props: { 'data-testid': `operator-${operator}` },
          },
        ],
      }));
  }, [cluster.monitoredOperators, operatorNames, operators]);

  return (
    <Table
      rows={rows as IRow[]}
      cells={['', '']}
      variant={TableVariant.compact}
      borders={false}
      className="review-table"
    >
      <TableBody />
    </Table>
  );
};
