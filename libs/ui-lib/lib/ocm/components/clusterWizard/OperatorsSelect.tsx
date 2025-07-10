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
  useStateSafely,
} from '../../../common';
import { OperatorsService } from '../../services';
import { useFeature } from '../../hooks/use-feature';
import OperatorCheckbox from '../clusterConfiguration/operators/OperatorCheckbox';
import { useOperatorSpecs } from '../../../common/components/operators/operatorSpecs';

const OperatorsSelect = ({
  cluster,
  bundles,
  preflightRequirements,
}: {
  cluster: Cluster;
  bundles: Bundle[];
  preflightRequirements: PreflightHardwareRequirements | undefined;
}) => {
  const [isLoading, setIsLoading] = useStateSafely(true);
  const { addAlert } = useAlerts();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [supportedOperators, setSupportedOperators] = useStateSafely<string[]>([]);
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const { values } = useFormikContext<OperatorsValues>();
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
  }, [addAlert, setSupportedOperators, setIsLoading]);

  const { byCategory, byKey: opSpecs } = useOperatorSpecs();

  const operators = React.useMemo(() => {
    return supportedOperators.filter((op) => {
      if (!isSingleClusterFeatureEnabled) {
        return true;
      }
      return singleClusterOperators.includes(op);
    });
  }, [isSingleClusterFeatureEnabled, supportedOperators]);

  if (isLoading) {
    return <LoadingState />;
  }

  // Calculate all selected operators (direct selections + bundle selections)
  const bundleOperators = values.selectedBundles.flatMap(
    (bundleId) => bundles.find((b) => b.id === bundleId)?.operators || [],
  );

  const allSelectedOperators = values.selectedOperators
    .concat(bundleOperators)
    .filter((op, index, array) => array.indexOf(op) === index); // Remove duplicates

  const selectedOperators = allSelectedOperators.filter((opKey) => !!opSpecs[opKey]);

  return (
    <ExpandableSection
      toggleText={`Single Operators (${operators.length} | ${selectedOperators.length} selected)`}
      onToggle={() => setIsExpanded(!isExpanded)}
      isExpanded={isExpanded}
      data-testid="single-operators-section"
    >
      <Stack hasGutter data-testid={'operators-form'}>
        {Object.entries(byCategory).map(([categoryName, specs]) => {
          const categoryOperators = specs.filter((spec) => operators.includes(spec.operatorKey));
          if (categoryOperators.length === 0) {
            return null;
          }

          return (
            <React.Fragment key={categoryName}>
              <StackItem>
                <strong>{categoryName}</strong>
              </StackItem>
              {categoryOperators.map((spec) => (
                <StackItem key={spec.operatorKey}>
                  <OperatorCheckbox
                    bundles={bundles}
                    operatorId={spec.operatorKey}
                    cluster={cluster}
                    openshiftVersion={cluster.openshiftVersion}
                    preflightRequirements={preflightRequirements}
                    {...spec}
                  />
                </StackItem>
              ))}
            </React.Fragment>
          );
        })}
      </Stack>
    </ExpandableSection>
  );
};

export default OperatorsSelect;
