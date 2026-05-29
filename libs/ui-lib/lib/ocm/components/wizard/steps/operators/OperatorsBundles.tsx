import * as React from 'react';
import { Gallery, GalleryItem, Stack, StackItem, Title } from '@patternfly/react-core';
import { Bundle, Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { selectClusterValidationsInfo, singleClusterBundles } from '../../../../../common';
import { useFeature } from '../../../../hooks/use-feature';
import { BundleCard } from './fields';

export const OperatorsBundles = ({
  bundles,
  allBundles,
  searchTerm,
  cluster,
}: {
  bundles: Bundle[];
  allBundles: Bundle[];
  searchTerm?: string;
  cluster: Cluster;
}) => {
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const openshiftAiGpuInfoMessage = React.useMemo(() => {
    const validationsInfo = selectClusterValidationsInfo(cluster);
    if (!validationsInfo) {
      return undefined;
    }
    return Object.values(validationsInfo)
      .flat()
      .find(
        (validation) =>
          validation?.id === 'openshift-ai-gpu-requirements-satisfied' &&
          validation?.status === 'success' &&
          !!validation.message,
      )?.message;
  }, [cluster]);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2" size="lg">
          {allBundles.length > 0 ? 'Bundles' : ''}
        </Title>
      </StackItem>
      <StackItem>
        <Gallery hasGutter minWidths={{ default: '350px' }}>
          {(isSingleClusterFeatureEnabled
            ? allBundles.filter((b) => b.id && singleClusterBundles.includes(b.id))
            : allBundles
          ).map((bundle) => (
            <GalleryItem key={bundle.id}>
              <BundleCard
                bundle={bundles.find((b) => b.id === bundle.id) || bundle}
                bundles={bundles}
                searchTerm={searchTerm}
                informationalMessage={
                  bundle.id === 'openshift-ai' ? openshiftAiGpuInfoMessage : undefined
                }
              />
            </GalleryItem>
          ))}
        </Gallery>
      </StackItem>
    </Stack>
  );
};
