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
import fuzzysearch from 'fuzzysearch';

const OperatorsSelect = ({
  cluster,
  bundles,
  preflightRequirements,
  searchTerm = '',
}: {
  cluster: Cluster;
  bundles: Bundle[];
  preflightRequirements: PreflightHardwareRequirements | undefined;
  searchTerm?: string;
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

  const opSpecs = useOperatorSpecs();

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

  const bundledOperatorIds = bundles.flatMap((bundle) => bundle.operators || []);

  const filteredOperators = React.useMemo(() => {
    const inBundles = new Set(bundledOperatorIds);

    return operators.filter((op) => {
      const spec = opSpecs[op];
      if (!spec) return false;

      const title = spec.title?.toLowerCase() || '';
      const description = spec.descriptionText?.toLowerCase() || '';
      const matchesSearch =
        searchTerm === '' ||
        fuzzysearch(searchTerm.toLowerCase(), op.toLowerCase()) ||
        fuzzysearch(searchTerm.toLowerCase(), title) ||
        fuzzysearch(searchTerm.toLowerCase(), description);

      const isInBundle = inBundles.has(op);

      return (
        (isInBundle || matchesSearch) &&
        (!isSingleClusterFeatureEnabled || singleClusterOperators.includes(op))
      );
    });
  }, [bundledOperatorIds, operators, opSpecs, searchTerm, isSingleClusterFeatureEnabled]);

  const selectedOperators = values.selectedOperators.filter(
    (opKey) => filteredOperators.includes(opKey) && !!opSpecs[opKey],
  );

  const groupedOperators = React.useMemo(() => {
    const groups: Record<string, string[]> = {};

    for (const op of filteredOperators) {
      const spec = opSpecs[op];
      if (!spec) continue;

      const category = spec.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(op);
    }

    return groups;
  }, [filteredOperators, opSpecs]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ExpandableSection
      toggleText={`Single Operators (${filteredOperators.length} | ${selectedOperators.length} selected)`}
      onToggle={() => setIsExpanded(!isExpanded)}
      isExpanded={isExpanded}
      data-testid="single-operators-section"
    >
      <Stack hasGutter data-testid={'operators-form'}>
        {Object.entries(groupedOperators).map(([category, ops]) => (
          <React.Fragment key={category}>
            <StackItem>
              <strong>{category}</strong>
            </StackItem>
            {ops.map((operatorKey) => {
              const spec = opSpecs[operatorKey];
              return (
                <StackItem key={operatorKey}>
                  <OperatorCheckbox
                    bundles={bundles}
                    operatorId={operatorKey}
                    cluster={cluster}
                    openshiftVersion={cluster.openshiftVersion}
                    preflightRequirements={preflightRequirements}
                    {...spec}
                  />
                </StackItem>
              );
            })}
          </React.Fragment>
        ))}
      </Stack>
    </ExpandableSection>
  );
};

export default OperatorsSelect;
