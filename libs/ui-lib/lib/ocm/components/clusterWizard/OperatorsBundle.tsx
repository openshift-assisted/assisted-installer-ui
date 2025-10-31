import * as React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Gallery,
  GalleryItem,
  List,
  ListItem,
  Stack,
  StackItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import {
  Bundle,
  PreflightHardwareRequirements,
} from '@openshift-assisted/types/assisted-installer-service';
import { ExternalLink, OperatorsValues, PopoverIcon, singleClusterBundles } from '../../../common';
import { useFormikContext } from 'formik';
import { useNewFeatureSupportLevel } from '../../../common/components/newFeatureSupportLevels';
import { useFeature } from '../../hooks/use-feature';
import { useSelector } from 'react-redux';
import { selectIsCurrentClusterSNO } from '../../store/slices/current-cluster/selectors';
import { getNewBundleOperators } from '../clusterConfiguration/operators/utils';
import { bundleSpecs } from '../clusterConfiguration/operators/bundleSpecs';
import {
  highlightMatch,
  useOperatorSpecs,
} from '../../../common/components/operators/operatorSpecs';
import { useClusterWizardContext } from './ClusterWizardContext';
import './OperatorsBundle.css';

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

const BundleCard = ({
  bundle,
  bundles,
  preflightRequirements,
  searchTerm,
}: {
  bundle: Bundle;
  bundles: Bundle[];
  preflightRequirements: PreflightHardwareRequirements | undefined;
  searchTerm?: string;
}) => {
  const { values, setFieldValue } = useFormikContext<OperatorsValues>();
  const isSNO = useSelector(selectIsCurrentClusterSNO);
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
    values.selectedBundles.includes(b),
  );
  const isAssistedMigration = uiSettings?.isAssistedMigration;
  const disabledReason = hasUnsupportedOperators
    ? 'Some operators in this bundle are not supported with the current configuration.'
    : isSNO && bundleSpec?.noSNO
    ? bundle.id === 'openshift-ai'
      ? 'This bundle is not available when deploying a Single Node OpenShift, but you can use the standalone operator instead.'
      : 'This bundle is not available when deploying a Single Node OpenShift.'
    : incompatibleBundle
    ? `Bundle cannot be installed together with ${
        bundles.find(({ id }) => id === incompatibleBundle)?.title || incompatibleBundle
      }`
    : isAssistedMigration
    ? 'This bundle needs to be selected for clusters created from Migration Assessment'
    : undefined;

  const onSelect = (checked: boolean) => {
    const newBundles = checked
      ? [...values.selectedBundles, bundle.id || '']
      : values.selectedBundles.filter((sb) => sb !== bundle.id);
    setFieldValue('selectedBundles', newBundles);
    const newOperators = getNewBundleOperators(
      values.selectedOperators,
      newBundles,
      bundles,
      bundle,
      preflightRequirements,
      checked,
    );
    setFieldValue('selectedOperators', newOperators);
  };

  const isSelected = values.selectedBundles.includes(bundle.id || '');
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
            onChange: (_, checked) => onSelect(checked),
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
          </Stack>
        </CardBody>
      </Card>
    </Tooltip>
  );
};

const OperatorsBundle = ({
  bundles,
  preflightRequirements,
  searchTerm,
}: {
  bundles: Bundle[];
  preflightRequirements: PreflightHardwareRequirements | undefined;
  searchTerm?: string;
}) => {
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2" size="lg">
          {bundles.length > 0 ? 'Bundles' : ''}
        </Title>
      </StackItem>
      <StackItem>
        <Gallery hasGutter minWidths={{ default: '350px' }}>
          {(isSingleClusterFeatureEnabled
            ? bundles.filter((b) => b.id && singleClusterBundles.includes(b.id))
            : bundles
          ).map((bundle) => (
            <GalleryItem key={bundle.id}>
              <BundleCard
                bundle={bundle}
                bundles={bundles}
                preflightRequirements={preflightRequirements}
                searchTerm={searchTerm}
              />
            </GalleryItem>
          ))}
        </Gallery>
      </StackItem>
    </Stack>
  );
};

export default OperatorsBundle;
