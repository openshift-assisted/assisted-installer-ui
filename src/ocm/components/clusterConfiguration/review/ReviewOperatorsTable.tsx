import React from 'react';
import { Table, TableVariant, TableBody } from '@patternfly/react-table';
import {
  Cluster,
  ExposedOperatorNames,
  hasEnabledOperators,
  genericTableRowKey,
  operatorLabels,
  useFeatureSupportLevel,
} from '../../../../common';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { getActualLVMOperatorName } from '../operators/utils';

export const ReviewOperatorsTable = ({ cluster }: { cluster: Cluster }) => {
  const { t } = useTranslation();
  const operatorNames = operatorLabels(t);
  const featureSupportLevel = useFeatureSupportLevel();

  const rows = React.useMemo(() => {
    return ExposedOperatorNames.filter((operator) =>
      hasEnabledOperators(cluster.monitoredOperators, operator),
    )
      .map((operator) =>
        getActualLVMOperatorName({
          openshiftVersion: cluster.openshiftVersion,
          featureSupportLevel,
          operator,
        }),
      )
      .map((operator) => ({
        rowId: `operator-${operator}`,
        cells: [
          operatorNames[operator],
          {
            title: 'Enabled',
            props: { 'data-testid': `operator-${operator}` },
          },
        ],
      }));
  }, [cluster.monitoredOperators, cluster.openshiftVersion, featureSupportLevel, operatorNames]);

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
