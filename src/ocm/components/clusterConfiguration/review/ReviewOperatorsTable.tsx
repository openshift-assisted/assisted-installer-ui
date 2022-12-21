import { Table, TableVariant, TableBody } from '@patternfly/react-table';
import React from 'react';
import {
  Cluster,
  hasEnabledOperators,
  isSNO,
  operatorLabels,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_LVM,
  OPERATOR_NAME_ODF,
} from '../../../../common';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';

export const ReviewOperatorsTable = ({ cluster }: { cluster: Cluster }) => {
  const { t } = useTranslation();
  const operatorNames = operatorLabels(t);

  const rows = React.useMemo(() => {
    return [
      {
        cells: [
          operatorNames[OPERATOR_NAME_CNV],
          {
            title: hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_CNV)
              ? 'Enabled'
              : 'Disabled',
            props: { 'data-testId': 'openshift-virtualization' },
          },
        ],
      },
      !isSNO(cluster) && {
        cells: [
          operatorNames[OPERATOR_NAME_ODF],
          {
            title: hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_ODF)
              ? 'Enabled'
              : 'Disabled',
            props: { 'data-testId': 'openshift-data-foundation' },
          },
        ],
      },
      isSNO(cluster) && {
        cells: [
          operatorNames[OPERATOR_NAME_LVM],
          {
            title: hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_LVM)
              ? 'Enabled'
              : 'Disabled',
            props: { 'data-testId': 'openshift-data-foundation' },
          },
        ],
      },
    ];
  }, [cluster, operatorNames]);

  return (
    <Table
      rows={rows}
      cells={['', '']}
      variant={TableVariant.compact}
      borders={false}
      className="review-table"
    >
      <TableBody />
    </Table>
  );
};
