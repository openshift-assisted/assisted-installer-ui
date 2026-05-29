import React from 'react';
import { Title } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Tr } from '@patternfly/react-table';
import { Cluster, Bundle } from '@openshift-assisted/types/assisted-installer-service';
import {
  genericTableRowKey,
  selectAllOlmOperators,
  useStateSafely,
  useOperatorSpecs,
} from '../../../../common';
import { BundleService } from '../../../services/BundleService';
import { TableSummaryExpandable } from './TableSummaryExpandable';

const fetchBundles = async (
  openshiftVersion: string,
  cpuArchitecture: string,
  platformType: string,
): Promise<Bundle[]> => {
  try {
    return await BundleService.listBundles(
      openshiftVersion,
      cpuArchitecture,
      platformType,
      undefined,
    );
  } catch (_e) {
    return [] as Bundle[];
  }
};

export const ReviewOperatorsTable = ({ cluster }: { cluster: Cluster }) => {
  const { byKey: opSpecs } = useOperatorSpecs();
  const selectedBundles = cluster.operatorBundles || [];
  const [bundleTitlesById, setBundleTitlesById] = useStateSafely<Record<string, string>>({});
  const hasFetchedBundles = React.useRef(false);
  const hasSelectedBundles = selectedBundles.length > 0;
  React.useEffect(() => {
    if (!hasFetchedBundles.current && hasSelectedBundles) {
      hasFetchedBundles.current = true;
      void (async () => {
        const bundles = await fetchBundles(
          cluster.openshiftVersion || '',
          cluster.cpuArchitecture || '',
          cluster.platform?.type || '',
        );
        const titlesById = Object.fromEntries(
          bundles
            .filter((bundle) => !!bundle.id && !!bundle.title)
            .map((bundle) => [bundle.id, bundle.title]),
        ) as Record<string, string>;
        setBundleTitlesById(titlesById);
      })();
    }
  }, [
    cluster.cpuArchitecture,
    cluster.openshiftVersion,
    cluster.platform?.type,
    hasSelectedBundles,
    setBundleTitlesById,
  ]);

  const bundleRows = selectedBundles.map((bundle) => ({
    rowId: `bundle-${bundle.id}`,
    cells: [
      {
        title: bundleTitlesById[bundle.id] || bundle.id,
        props: { 'data-testid': `bundle-${bundle.id}` },
      },
    ],
  }));

  const rows = React.useMemo(
    () =>
      selectAllOlmOperators(cluster)
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
