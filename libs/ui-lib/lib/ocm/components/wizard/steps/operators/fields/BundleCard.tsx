import React from 'react';
import { useFormikContext } from 'formik';
import {
  Alert,
  Stack,
  StackItem,
  List,
  ListItem,
  Tooltip,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from '@patternfly/react-core';
import { Bundle } from '@openshift-assisted/types/assisted-installer-service';
import {
  PopoverIcon,
  ExternalLink,
  OperatorsValues,
  useNewFeatureSupportLevel,
  useOperatorSpecs,
  highlightMatch,
} from '../../../../../../common';
import { useClusterWizardContext } from '../../../clusterWizardContext';
import { OptionalOperatorsDropdown } from './OptionalOperatorsDropdown';
import { bundleSpecs } from './bundleSpecs';

import './BundleCard.css';

const BundleLabel = ({ bundle, searchTerm }: { bundle: Bundle; searchTerm?: string }) => {
  const { byKey: opSpecs } = useOperatorSpecs();
  const bundleSpec = bundleSpecs[bundle.id || ''];
  return (
    <>
      <span>{highlightMatch(bundle.title || '', searchTerm)} </span>
      <PopoverIcon
        component={'a'}
        headerContent={<div>Requirements and dependencies</div>}
        bodyContent={
          <Stack hasGutter>
            {bundleSpec?.Description && (
              <StackItem>
                <bundleSpec.Description />
              </StackItem>
            )}
            {bundle.operators?.length && (
              <>
                <StackItem>Bundle operators:</StackItem>
                <StackItem>
                  <List>
                    {bundle.operators.map((op) => (
                      <ListItem key={op}>{opSpecs[op]?.title || op}</ListItem>
                    ))}
                  </List>
                </StackItem>
              </>
            )}
            {bundleSpec?.docsLink && (
              <StackItem>
                <ExternalLink href={bundleSpec.docsLink}>Learn more</ExternalLink>
              </StackItem>
            )}
          </Stack>
        }
      />
    </>
  );
};

export const BundleCard = ({
  bundle,
  bundles,
  searchTerm,
  informationalMessage,
}: {
  bundle: Bundle;
  bundles: Bundle[];
  searchTerm?: string;
  informationalMessage?: string;
}) => {
  const { values, setFieldValue } = useFormikContext<OperatorsValues>();
  const { isFeatureSupported } = useNewFeatureSupportLevel();
  const { byKey: opSpecs } = useOperatorSpecs();
  const { uiSettings } = useClusterWizardContext();

  const hasUnsupportedOperators = !!bundle.operators?.some((op) => {
    const operatorSpec = opSpecs[op];
    if (!operatorSpec) {
      return false;
    }
    return !isFeatureSupported(operatorSpec.featureId);
  });

  const bundleSpec = bundleSpecs[bundle.id || ''];

  const incompatibleBundle = bundleSpec?.incompatibleBundles?.find((b) =>
    values.selectedBundles.some((bundleSelection) => bundleSelection.id === b),
  );
  const isAssistedMigration = uiSettings?.isAssistedMigration;
  const disabledReason = hasUnsupportedOperators
    ? 'Some operators in this bundle are not supported with the current configuration.'
    : incompatibleBundle
    ? `Bundle cannot be installed together with ${
        bundles.find(({ id }) => id === incompatibleBundle)?.title || incompatibleBundle
      }`
    : isAssistedMigration
    ? 'This bundle needs to be selected for clusters created from Migration Assessment'
    : !bundles.some((b) => b.id === bundle.id)
    ? 'This bundle is not available for the current configuration, you might be able to use the standalone operators instead.'
    : undefined;

  const addBundle = (
    selectedBundles: OperatorsValues['selectedBundles'],
    bundle: Bundle,
  ): OperatorsValues['selectedBundles'] => [
    ...selectedBundles,
    { id: bundle.id || '', optionalOperators: bundle.optionalOperators || [] },
  ];

  const removeBundle = (
    selectedBundles: OperatorsValues['selectedBundles'],
    bundleId: Bundle['id'],
  ): OperatorsValues['selectedBundles'] =>
    selectedBundles.filter((selectedBundle) => selectedBundle.id !== bundleId);

  const onSelect = (checked: boolean) => {
    const nextBundles = checked
      ? addBundle(values.selectedBundles, bundle)
      : removeBundle(values.selectedBundles, bundle.id);
    setFieldValue('selectedBundles', nextBundles);
  };

  const isSelected = values.selectedBundles.some(
    (selectedBundle) => selectedBundle.id === bundle.id,
  );
  const checkboxId = `bundle-${bundle.id || ''}`;
  return (
    <Tooltip content={disabledReason} hidden={!disabledReason}>
      <Card
        isDisabled={!!disabledReason}
        isFullHeight
        isClickable
        isSelectable
        isSelected={isSelected}
        className="ai-bundle-card"
      >
        <CardHeader
          selectableActions={{
            selectableActionId: checkboxId,
            selectableActionAriaLabelledby: checkboxId,
            name: checkboxId,
            onChange: (_, checked) => onSelect(!!checked),
            isChecked: isSelected,
          }}
        >
          <CardTitle>
            <BundleLabel bundle={bundle} searchTerm={searchTerm} />
          </CardTitle>
        </CardHeader>
        <CardBody isFilled>
          <Stack hasGutter>
            <StackItem isFilled>
              <div>{highlightMatch(bundle.description || '', searchTerm)}</div>
            </StackItem>
            {!!bundle.optionalOperators?.length && (
              <StackItem onClick={(e) => e.stopPropagation()}>
                <OptionalOperatorsDropdown
                  bundleId={bundle.id || ''}
                  optionalOperatorIds={bundle.optionalOperators}
                  selectedBundles={values.selectedBundles}
                  setSelectedBundles={(selectedBundles) =>
                    setFieldValue('selectedBundles', selectedBundles)
                  }
                  isDisabled={!isSelected || !!disabledReason}
                  getOperatorLabel={(operatorId) => opSpecs[operatorId]?.title || operatorId}
                />
              </StackItem>
            )}
            {informationalMessage && (
              <StackItem>
                <Alert isInline variant="info" title={informationalMessage} />
              </StackItem>
            )}
          </Stack>
        </CardBody>
      </Card>
    </Tooltip>
  );
};
