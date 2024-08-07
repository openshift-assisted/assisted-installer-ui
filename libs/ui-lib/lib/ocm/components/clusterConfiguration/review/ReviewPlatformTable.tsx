import React from 'react';
import { TableVariant } from '@patternfly/react-table';
import { Table, TableBody } from '@patternfly/react-table/deprecated';
import { genericTableRowKey } from '../../../../common';
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
      rows={rows}
      cells={['', '']}
      variant={TableVariant.compact}
      borders={false}
      aria-label={'Platform'}
      className="review-table"
    >
      <TableBody rowKey={genericTableRowKey} />
    </Table>
  );
};
