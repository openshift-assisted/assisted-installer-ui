import { Table, TableVariant, TableBody } from '@patternfly/react-table';
import React from 'react';
import {
  Cluster,
  hasEnabledOperators,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_ODF,
} from '../../../../common';

export const ReviewOperatorsTable = ({ cluster }: { cluster: Cluster }) => {
  const rows = React.useMemo(() => {
    return [
      {
        cells: [
          'OpenShift Virtualization',
          {
            title: hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_CNV)
              ? 'Enabled'
              : 'Disabled',
            props: { 'data-testId': 'openshift-virtualization' },
          },
        ],
      },
      {
        cells: [
          'OpenShift Data Foundation',
          {
            title: hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_ODF)
              ? 'Enabled'
              : 'Disabled',
            props: { 'data-testId': 'openshift-data-foundation' },
          },
        ],
      },
    ];
  }, [cluster]);

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
