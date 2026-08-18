import React from 'react';
import { Flex, FlexItem, SearchInput, Stack, StackItem } from '@patternfly/react-core';
import { Bundle } from '@openshift-assisted/types/assisted-installer-service';
import {
  ClusterOperatorProps,
  ClusterWizardStepHeader,
  getApiErrorMessage,
  handleApiError,
  LoadingState,
  useAlerts,
} from '../../../../../common';
import { BundleService } from '../../../../services';
import { useClusterPreflightRequirements } from '../../../../hooks';
import { OperatorsBundles } from './OperatorsBundles';
import { OperatorsSelect } from './OperatorsSelect';

export const OperatorsStep = ({ cluster }: ClusterOperatorProps) => {
  const { addAlert } = useAlerts();
  const [bundlesLoading, setBundlesLoading] = React.useState(true);
  const [bundles, setBundles] = React.useState<Bundle[]>([]);
  const [allBundles, setAllBundles] = React.useState<Bundle[]>([]);
  const { preflightRequirements, isLoading } = useClusterPreflightRequirements(cluster.id);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const fetchBundles = async () => {
      try {
        const fetchedBundles = await BundleService.listBundles(
          cluster?.openshiftVersion || '',
          cluster?.cpuArchitecture || '',
          cluster?.platform?.type || '',
          cluster?.controlPlaneCount === 1 ? 'SNO' : undefined,
        );
        const allBundles = await BundleService.listBundles(
          cluster?.openshiftVersion || '',
          cluster?.cpuArchitecture || '',
          cluster?.platform?.type || '',
          undefined,
        );
        setBundles(fetchedBundles);
        setAllBundles(allBundles);
      } catch (error) {
        handleApiError(error, () =>
          addAlert({
            title: 'Failed to fetch operator bundles',
            message: getApiErrorMessage(error),
          }),
        );
      } finally {
        setBundlesLoading(false);
      }
    };

    void fetchBundles();
  }, [
    addAlert,
    cluster.cpuArchitecture,
    cluster.openshiftVersion,
    cluster.platform?.type,
    cluster.controlPlaneCount,
  ]);

  const filteredBundles = bundles.filter(
    (bundle) =>
      bundle.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bundle.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading || bundlesLoading) {
    return <LoadingState />;
  }

  return (
    <Stack hasGutter data-testid={'operators-page'}>
      <StackItem>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
        >
          <FlexItem>
            <ClusterWizardStepHeader>Operators</ClusterWizardStepHeader>
          </FlexItem>
          <FlexItem style={{ minWidth: '300px' }}>
            <SearchInput
              placeholder={'Find bundles or operators'}
              value={searchTerm}
              onChange={(_e, value) => setSearchTerm(value)}
              onClear={() => setSearchTerm('')}
            />
          </FlexItem>
        </Flex>
      </StackItem>
      <StackItem>
        <OperatorsBundles
          bundles={filteredBundles}
          searchTerm={searchTerm}
          allBundles={allBundles}
          cluster={cluster}
        />
      </StackItem>
      <StackItem>
        <OperatorsSelect
          bundles={bundles}
          cluster={cluster}
          preflightRequirements={preflightRequirements}
          searchTerm={searchTerm}
        />
      </StackItem>
    </Stack>
  );
};
