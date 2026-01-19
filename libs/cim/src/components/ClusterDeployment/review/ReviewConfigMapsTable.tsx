import React from 'react';
import { useConfigMaps } from '../../../hooks';
import { Table, TableVariant, Tbody, Td, Tr } from '@patternfly/react-table';
import { genericTableRowKey, LoadingState } from '@openshift-assisted/common';
import { AgentClusterInstallK8sResource } from '../../../types';

export const ReviewConfigMapsTable = ({
  agentClusterInstall,
}: {
  agentClusterInstall: AgentClusterInstallK8sResource;
}) => {
  const [configMaps, loaded] = useConfigMaps({
    namespace: agentClusterInstall.metadata?.namespace,
    isList: true,
  });

  const customManifests = React.useMemo(() => {
    const maps = configMaps.filter((configMap) =>
      agentClusterInstall.spec?.manifestsConfigMapRefs
        ?.flatMap((ref) => ref.name)
        .includes(configMap.metadata?.name || ''),
    );

    return maps
      .map((map, index) => [
        {
          rowId: `config-map-${index}`,
          cells: [{ title: map.metadata?.name as string, isExpanded: true, level: 1, posInset: 1 }],
        },
        ...Object.keys(map.data || {}).map((key) => ({
          rowId: `config-map-${index}-${key}`,
          cells: [
            {
              title: (
                <>
                  <span style={{ width: '1rem', display: 'inline-block' }} />
                  {key}
                </>
              ),
              posInset: 2,
              level: 2,
            },
          ],
        })),
      ])
      .flat();
  }, [agentClusterInstall.spec?.manifestsConfigMapRefs, configMaps]);

  return loaded ? (
    <Table
      variant={TableVariant.compact}
      borders={false}
      data-testid="review-custom-manifests-table"
    >
      <Tbody>
        {customManifests.map((row, i) => (
          <Tr key={genericTableRowKey(row.rowId)}>
            {row.cells.map(({ title, ...props }, j) => (
              <Td key={`cell-${i}-${j}`} {...props}>
                {title}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  ) : (
    <LoadingState />
  );
};
