import React from 'react';
import { Flex, FlexItem, Stack, StackItem, TextInput } from '@patternfly/react-core';
import { Bundle } from '@openshift-assisted/types/assisted-installer-service';
import {
  ClusterOperatorProps,
  ClusterWizardStepHeader,
  getApiErrorMessage,
  handleApiError,
  LoadingState,
  useAlerts,
} from '../../../common';
import OperatorsBundle from './OperatorsBundle';
import OperatorsSelect from './OperatorsSelect';
import BundleService from '../../services/BundleService';
import { useClusterPreflightRequirements } from '../../hooks';

export const OperatorsStep = ({ cluster }: ClusterOperatorProps) => {
  const { addAlert } = useAlerts();
  const [bundlesLoading, setBundlesLoading] = React.useState(true);
  const [bundles, setBundles] = React.useState<Bundle[]>([]);
  const { preflightRequirements, isLoading } = useClusterPreflightRequirements(cluster.id);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const fetchBundles = async () => {
      try {
        const fetchedBundles = await BundleService.listBundles();
        setBundles(fetchedBundles);
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
  }, [addAlert]);

  if (isLoading || bundlesLoading) {
    return <LoadingState />;
  }

  const filteredBundles = bundles.filter(
    (bundle) =>
      bundle.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bundle.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
          <FlexItem>
            <TextInput
              value={searchTerm}
              type="text"
              onChange={(_event, value) => setSearchTerm(value)}
              placeholder="Search"
              style={{ width: '400px' }}
            />
          </FlexItem>
        </Flex>
      </StackItem>

      <StackItem>
        <OperatorsBundle bundles={filteredBundles} preflightRequirements={preflightRequirements} />
      </StackItem>
      <StackItem>
        <OperatorsSelect
          bundles={filteredBundles}
          cluster={cluster}
          preflightRequirements={preflightRequirements}
          searchTerm={searchTerm}
        />
      </StackItem>
    </Stack>
  );
};
