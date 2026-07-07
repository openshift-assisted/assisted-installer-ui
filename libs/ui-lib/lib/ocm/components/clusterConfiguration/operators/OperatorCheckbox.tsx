import * as React from 'react';
import {
  Checkbox,
  FormGroup,
  HelperText,
  HelperTextItem,
  List,
  ListItem,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import {
  Bundle,
  Cluster,
  PreflightHardwareRequirements,
  OperatorProperties,
} from '@openshift-assisted/types/assisted-installer-service';
import {
  selectCurrentClusterPermissionsState,
  selectIsCurrentClusterSNO,
} from '../../../store/slices/current-cluster/selectors';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import {
  getFieldId,
  OperatorsValues,
  PopoverIcon,
  getApiErrorMessage,
  handleApiError,
  useAlerts,
} from '../../../../common';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import {
  highlightMatch,
  OperatorSpec,
  useOperatorSpecs,
} from '../../../../common/components/operators/operatorSpecs';
import OperatorsService from '../../../services/OperatorsService';
import OperatorPropertiesForm from './OperatorPropertiesForm';

const OperatorRequirements = ({
  operatorId,
  preflightRequirements,
  Requirements,
  cluster,
}: {
  cluster: Cluster;
  operatorId: string;
  preflightRequirements: PreflightHardwareRequirements | undefined;
  Requirements?: React.ComponentType<{
    cluster: Cluster;
  }>;
}) => {
  const isSingleNode = useSelector(selectIsCurrentClusterSNO);

  const operator = preflightRequirements?.operators?.find(
    (operatorRequirements) => operatorRequirements.operatorName === operatorId,
  );

  const workerRequirements = operator?.requirements?.worker?.quantitative;
  const masterRequirements = operator?.requirements?.master?.quantitative;

  const hasWorkerRequirements = !!Object.keys(workerRequirements || {}).length;
  const hasMasterRequirements = !!Object.keys(masterRequirements || {}).length;

  if (!hasWorkerRequirements && !hasMasterRequirements && !Requirements) {
    return (
      <PopoverIcon
        component={'a'}
        id={operatorId}
        bodyContent="No additional requirements needed"
      />
    );
  }

  return (
    <PopoverIcon
      component={'a'}
      headerContent="Additional requirements"
      id={operatorId}
      bodyContent={
        <Stack hasGutter>
          {Requirements && (
            <StackItem>
              <Requirements cluster={cluster} />
            </StackItem>
          )}
          <StackItem>
            <List>
              {!isSingleNode && hasWorkerRequirements && (
                <ListItem>
                  Each worker node requires an additional {workerRequirements?.ramMib || 360} MiB of
                  memory {workerRequirements?.diskSizeGb ? ',' : ' and'}{' '}
                  {workerRequirements?.cpuCores || 2} CPU cores
                  {workerRequirements?.diskSizeGb
                    ? ` and ${workerRequirements?.diskSizeGb} storage space`
                    : ''}
                </ListItem>
              )}
              {hasMasterRequirements && (
                <ListItem>
                  Each control plane node requires an additional {masterRequirements?.ramMib || 150}{' '}
                  MiB of memory {masterRequirements?.diskSizeGb ? ',' : ' and'}{' '}
                  {masterRequirements?.cpuCores || 4} CPU cores
                  {masterRequirements?.diskSizeGb
                    ? ` and ${masterRequirements?.diskSizeGb} storage space`
                    : ''}
                </ListItem>
              )}
            </List>
          </StackItem>
        </Stack>
      }
    />
  );
};

const OperatorCheckbox = ({
  bundles,
  checkedOperatorIds,
  cluster,
  operatorId,
  isChecked,
  title,
  featureId,
  notStandalone,
  Description,
  Requirements,
  openshiftVersion,
  preflightRequirements,
  searchTerm,
}: {
  bundles: Bundle[];
  checkedOperatorIds: Set<string>;
  cluster: Cluster;
  operatorId: string;
  isChecked: boolean;
  openshiftVersion?: string;
  preflightRequirements: PreflightHardwareRequirements | undefined;
  searchTerm?: string;
} & OperatorSpec) => {
  const { getFeatureSupportLevel, getFeatureDisabledReason } = useNewFeatureSupportLevel();
  const { byKey: opSpecs } = useOperatorSpecs();
  const { addAlert } = useAlerts();

  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const { values, setFieldValue } = useFormikContext<OperatorsValues>();
  const fieldId = getFieldId(operatorId, 'input');
  const supportLevel = getFeatureSupportLevel(featureId);
  const [operatorProperties, setOperatorProperties] = React.useState<OperatorProperties>([]);
  const [propertiesLoading, setPropertiesLoading] = React.useState(false);
  const [propertiesFetched, setPropertiesFetched] = React.useState(false);

  const getDisabledReason = (): string | undefined => {
    const featureDisabledReason = getFeatureDisabledReason(featureId);
    if (featureDisabledReason) {
      return featureDisabledReason;
    }

    const isRequiredByBundle = values.selectedBundles.some(
      (selectedBundle) =>
        !!bundles
          .find((bundle) => bundle.id === selectedBundle.id)
          ?.operators?.includes(operatorId),
    );
    if (isRequiredByBundle) {
      return 'This operator is part of a selected bundle and cannot be deselected.';
    }

    const isOptionallySelectedForBundle = values.selectedBundles.some((selectedBundle) =>
      selectedBundle.optionalOperators?.includes(operatorId),
    );
    if (isOptionallySelectedForBundle) {
      return 'This optional operator is selected through a bundle. Use the bundle card to change it.';
    }

    const parentOperator = preflightRequirements?.operators?.find(
      ({ operatorName, dependencies }) =>
        !!operatorName &&
        dependencies?.includes(operatorId) &&
        checkedOperatorIds.has(operatorName),
    );
    if (parentOperator?.operatorName) {
      const parentName = opSpecs[parentOperator.operatorName]?.title || parentOperator.operatorName;
      return `This operator is required by ${parentName}`;
    }

    if (notStandalone && !checkedOperatorIds.has(operatorId)) {
      return 'This operator cannot be installed as a standalone';
    }

    return undefined;
  };

  const disabledReason = getDisabledReason();
  const handleClick = (_: React.FormEvent, checked: boolean) => {
    const next = checked
      ? [...values.selectedOperators, operatorId]
      : values.selectedOperators.filter((op) => op !== operatorId);
    setFieldValue('selectedOperators', next);
  };

  // Fetch operator properties when operator is selected
  React.useEffect(() => {
    if (isChecked && !propertiesFetched && !propertiesLoading) {
      setPropertiesLoading(true);
      let cancelled = false;
      OperatorsService.getOperatorProperties(operatorId)
        .then((properties) => {
          if (!cancelled) {
            setOperatorProperties(properties);
            setPropertiesFetched(true);
          }
        })
        .catch((error) => {
          if (!cancelled) {
            handleApiError(error, () =>
              addAlert({
                title: 'Failed to fetch operator properties',
                message: getApiErrorMessage(error),
              }),
            );
          }
        })
        .finally(() => {
          if (!cancelled) {
            setPropertiesLoading(false);
          }
        });
      return () => {
        cancelled = true;
      };
    } else if (!isChecked) {
      // Clear properties when operator is unchecked to allow refetch on re-check
      setOperatorProperties([]);
      setPropertiesFetched(false);
    }
  }, [isChecked, operatorId, propertiesFetched, propertiesLoading, addAlert]);

  return (
    <FormGroup fieldId={fieldId} id={`form-control__${fieldId}`}>
      <Checkbox
        id={fieldId}
        label={
          <>
            <Tooltip hidden={!disabledReason} content={disabledReason}>
              <span>{highlightMatch(title, searchTerm)} </span>
            </Tooltip>
            <OperatorRequirements
              operatorId={operatorId}
              preflightRequirements={preflightRequirements}
              Requirements={Requirements}
              cluster={cluster}
            />
            <NewFeatureSupportLevelBadge featureId={featureId} supportLevel={supportLevel} />
          </>
        }
        aria-describedby={`${fieldId}-helper`}
        isChecked={isChecked}
        onChange={handleClick}
        isDisabled={isViewerMode || !!disabledReason}
        description={
          !!Description && (
            <HelperText>
              <HelperTextItem data-testid={`operator-checkbox-description-${operatorId}`}>
                <Description openshiftVersion={openshiftVersion} searchTerm={searchTerm} />
              </HelperTextItem>
            </HelperText>
          )
        }
        data-testid={`operator-checkbox-${operatorId}`}
      />
      {isChecked && operatorProperties.length > 0 && (
        <OperatorPropertiesForm
          operatorId={operatorId}
          properties={operatorProperties}
          isDisabled={isViewerMode || !!disabledReason}
        />
      )}
    </FormGroup>
  );
};

export default OperatorCheckbox;
