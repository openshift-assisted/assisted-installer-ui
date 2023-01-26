import React from 'react';
import { Table, TableVariant, TableBody, IRow } from '@patternfly/react-table';
import {
  Cluster,
  ExposedOperatorNames,
  hasEnabledOperators,
  operatorLabels,
} from '../../../../common';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';

export const ReviewOperatorsTable = ({ cluster }: { cluster: Cluster }) => {
  const { t } = useTranslation();
  const operatorNames = operatorLabels(t);

  const rows = React.useMemo(() => {
    return ExposedOperatorNames.filter((operator) =>
      hasEnabledOperators(cluster.monitoredOperators, operator),
    ).map((operator) => ({
      cells: [
        operatorNames[operator],
        {
          title: 'Enabled',
          props: { 'data-testid': `operator-${operator}` },
        },
      ],
    }));
  }, [cluster.monitoredOperators, operatorNames]);

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
