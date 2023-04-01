import React from 'react';
import { Table, TableVariant, TableBody } from '@patternfly/react-table';
import {
  Cluster,
  ExposedOperatorNames,
  hasEnabledOperators,
  genericTableRowKey,
  operatorLabels,
} from '../../../../common';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';

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
      rows={rows}
      cells={['', '']}
      variant={TableVariant.compact}
      borders={false}
      aria-label={'Operators review table'}
      className="review-table"
    >
      <TableBody rowKey={genericTableRowKey} />
    </Table>
  );
};
