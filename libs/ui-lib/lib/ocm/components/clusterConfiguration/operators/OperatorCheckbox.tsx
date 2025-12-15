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
} from '@openshift-assisted/types/assisted-installer-service';
import {
  selectCurrentClusterPermissionsState,
  selectIsCurrentClusterSNO,
} from '../../../store/slices/current-cluster/selectors';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { getFieldId, OperatorsValues, PopoverIcon } from '../../../../common';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import { getNewOperators } from './utils';
import {
  highlightMatch,
  OperatorSpec,
  useOperatorSpecs,
} from '../../../../common/components/operators/operatorSpecs';

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
  cluster,
  operatorId,
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
  cluster: Cluster;
  operatorId: string;
  openshiftVersion?: string;
  preflightRequirements: PreflightHardwareRequirements | undefined;
  searchTerm?: string;
} & OperatorSpec) => {
  const { getFeatureSupportLevel, getFeatureDisabledReason } = useNewFeatureSupportLevel();
  const { byKey: opSpecs } = useOperatorSpecs();

  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const { values, setFieldValue } = useFormikContext<OperatorsValues>();
  const fieldId = getFieldId(operatorId, 'input');
  const supportLevel = getFeatureSupportLevel(featureId);

  const isInBundle = values.selectedBundles.some(
    (sb) => !!bundles.find((b) => b.id === sb)?.operators?.includes(operatorId),
  );

  const isChecked = values.selectedOperators.includes(operatorId) || isInBundle;

  const parentOperator = preflightRequirements?.operators?.find((op) =>
    op.dependencies?.includes(operatorId),
  );

  let parentOperatorName = '';
  if (
    parentOperator?.operatorName &&
    values.selectedOperators.includes(parentOperator.operatorName)
  ) {
    parentOperatorName = opSpecs[parentOperator.operatorName]?.title || parentOperator.operatorName;
  }

  const disabledReason = isInBundle
    ? 'This operator is part of a bundle and cannot be deselected.'
    : notStandalone
    ? 'This operator cannot be installed as a standalone'
    : parentOperatorName
    ? `This operator is a dependency of ${parentOperatorName}`
    : getFeatureDisabledReason(featureId);

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
        onChange={(_, checked) => {
          setFieldValue(
            'selectedOperators',
            getNewOperators(
              values.selectedOperators,
              operatorId,
              preflightRequirements,
              checked,
              opSpecs,
            ),
          );
        }}
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
    </FormGroup>
  );
};

export default OperatorCheckbox;
