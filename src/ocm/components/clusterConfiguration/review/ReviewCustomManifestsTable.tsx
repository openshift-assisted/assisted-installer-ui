import React from 'react';
import { Table, TableVariant, TableBody } from '@patternfly/react-table';
import { Alert } from '@patternfly/react-core';
import { ListManifestsExtended } from '../manifestsConfiguration/data/dataTypes';
import { genericTableRowKey } from '../../../../common';

export const ReviewCustomManifestsTable = ({ manifests }: { manifests: ListManifestsExtended }) => {
  const rows = manifests?.map((manifest) => ({
    rowId:
      manifest.folder && manifest.fileName
        ? `manifest-detail-${manifest.folder}-${manifest.fileName}`
        : 'manifest-detail',
    cells: [
      {
        title:
          manifest.folder && manifest.fileName ? `${manifest.folder}/${manifest.fileName}` : '',
        props: {
          'data-testid':
            manifest.folder && manifest.fileName
              ? `manifest-detail-${manifest.folder}-${manifest.fileName}`
              : 'manifest-detail',
        },
      },
    ],
  }));

  return (
    <>
      <Table
        rows={rows}
        cells={['']}
        variant={TableVariant.compact}
        borders={false}
        className="review-table"
        aria-label="Custom manifests review table"
      >
        <TableBody rowKey={genericTableRowKey} />
      </Table>
      <Alert
        isInline
        variant="info"
        title={
          'The custom manifests might contain configurations which are conflicting with the above configurations and might cause installation failure.'
        }
      />
    </>
  );
};
