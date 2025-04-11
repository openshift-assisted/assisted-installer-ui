import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
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

  return (
    <Stack hasGutter data-testid={'operators-page'}>
      <StackItem>
        <ClusterWizardStepHeader>Operators</ClusterWizardStepHeader>
      </StackItem>
      <StackItem>
        <OperatorsBundle bundles={bundles} preflightRequirements={preflightRequirements} />
      </StackItem>
      <StackItem>
        <OperatorsSelect
          bundles={bundles}
          cluster={cluster}
          preflightRequirements={preflightRequirements}
        />
      </StackItem>
    </Stack>
  );
};
