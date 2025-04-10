import * as React from 'react';
import { ExpandableSection, Stack, StackItem } from '@patternfly/react-core';
import {
  Bundle,
  Cluster,
  PreflightHardwareRequirements,
} from '@openshift-assisted/types/assisted-installer-service';
import { useFormikContext } from 'formik';
import {
  getApiErrorMessage,
  handleApiError,
  LoadingState,
  OperatorsValues,
  singleClusterOperators,
  useAlerts,
} from '../../../common';
import { OperatorsService } from '../../services';
import { useFeature } from '../../hooks/use-feature';
import OperatorCheckbox from '../clusterConfiguration/operators/OperatorCheckbox';
import { getOperatorSpecs } from '../../../common/components/operators/operatorSpecs';
import { useNewFeatureSupportLevel } from '../../../common/components/newFeatureSupportLevels';

const OperatorsSelect = ({
  cluster,
  bundles,
  preflightRequirements,
}: {
  cluster: Cluster;
  bundles: Bundle[];
  preflightRequirements: PreflightHardwareRequirements | undefined;
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const { addAlert } = useAlerts();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [supportedOperators, setSupportedOperators] = React.useState<string[]>([]);
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const { values } = useFormikContext<OperatorsValues>();
  const { getFeatureSupportLevel } = useNewFeatureSupportLevel();

  React.useEffect(() => {
    const fetchSupportedOperators = async () => {
      try {
        const fetchedOperators = await OperatorsService.getSupportedOperators();
        setSupportedOperators(fetchedOperators);
      } catch (error) {
        handleApiError(error, () =>
          addAlert({ title: 'Failed to fetch operators', message: getApiErrorMessage(error) }),
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSupportedOperators();
  }, [addAlert]);

  const useLVMS = getFeatureSupportLevel('LVM') === 'supported';
  const opSpecs = React.useMemo(() => getOperatorSpecs(useLVMS), [useLVMS]);

  const operators = React.useMemo(() => {
    return supportedOperators
      .sort((a, b) => {
        const aTitle = opSpecs[a]?.title || a;
        const bTitle = opSpecs[b]?.title || b;
        return aTitle.localeCompare(bTitle);
      })
      .filter((op) => {
        if (!isSingleClusterFeatureEnabled) {
          return true;
        }
        return singleClusterOperators.includes(op);
      });
  }, [isSingleClusterFeatureEnabled, supportedOperators, opSpecs]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ExpandableSection
      toggleText={`Single Operators (${operators.length} | ${values.selectedOperators.length} selected)`}
      onToggle={() => setIsExpanded(!isExpanded)}
      isExpanded={isExpanded}
      data-testid="single-operators-section"
    >
      <Stack hasGutter data-testid={'operators-form'}>
        {operators.map((operatorKey) => {
          if (!opSpecs[operatorKey]) {
            return null;
          }

          return (
            <StackItem key={operatorKey}>
              <OperatorCheckbox
                bundles={bundles}
                operatorId={operatorKey}
                cluster={cluster}
                openshiftVersion={cluster.openshiftVersion}
                preflightRequirements={preflightRequirements}
                {...opSpecs[operatorKey]}
              />
            </StackItem>
          );
        })}
      </Stack>
    </ExpandableSection>
  );
};

export default OperatorsSelect;
