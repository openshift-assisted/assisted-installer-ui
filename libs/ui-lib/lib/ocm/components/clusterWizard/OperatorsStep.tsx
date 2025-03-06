/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  CardBody,
  CardTitle,
  Checkbox,
  ExpandableSection,
  Flex,
  FlexItem,
  Gallery,
  GalleryItem,
  Stack,
  StackItem,
  TextInput,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import {
  ClusterOperatorProps,
  ClusterWizardStepHeader,
  numberOfEnabledOperators,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_ODF,
  OperatorsValues,
  PopoverIcon,
} from '../../../common';
import { selectIsCurrentClusterSNO } from '../../store/slices/current-cluster/selectors';
import { isOCPVersionEqualsOrMajor } from '../utils';
import BundleService from '../../services/BundleService';
import { Bundle } from '@openshift-assisted/types/./assisted-installer-service';
import { OperatorsService } from '../../services';
import {
  mapOperatorIdToFeatureId,
  mapOperatorsToFieldIds,
  operatorComponentMap,
} from '../clusterConfiguration/operators/SupportedOperators';
import { useClusterWizardContext } from './ClusterWizardContext';
import { useFormikContext } from 'formik';
import NewFeatureSupportLevelBadge from '../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { useNewFeatureSupportLevel } from '../../../common/components/newFeatureSupportLevels';
import {
  getCnvDisabledWithMtvReason,
  getCnvIncompatibleWithLvmReason,
  getLvmIncompatibleWithCnvReason,
  getLvmsIncompatibleWithOdfReason,
  getOdfIncompatibleWithLvmsReason,
  getOpenShiftAIIncompatibleWithLvmsReason,
} from '../featureSupportLevels/featureStateUtils';
import OpenshiftAINvidiaRequirements from '../clusterConfiguration/operators/OpenshiftAINvidiaRequirements';
import OpenshiftAIAmdRequirements from '../clusterConfiguration/operators/OpenshiftAIAmdRequirements';
import VirtualizationRequirements from '../clusterConfiguration/operators/VirtualizationRequirements';

const operatorsThatCanNotBeInstalledAlone = [
  'nvdia-gpu',
  'pipelines',
  'servicemesh',
  'serverless',
  'authorino',
  'lso',
];

export const OperatorsStep = (props: ClusterOperatorProps) => {
  const isSNO = useSelector(selectIsCurrentClusterSNO);
  const isVersionEqualsOrMajorThan4_15 = isOCPVersionEqualsOrMajor(
    props.openshiftVersion || '',
    '4.15',
  );

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [supportedOperators, setSupportedOperators] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [selectedBundles, setSelectedBundles] = useState<{ [key: string]: boolean }>({});
  const [bundleOperators, setBundleOperators] = useState<string[]>([]);
  const { updateUISettings, uiSettings } = useClusterWizardContext();
  const { values, setFieldValue } = useFormikContext<OperatorsValues>();
  const featureSupportLevelData = useNewFeatureSupportLevel();

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const fetchedBundles = await BundleService.listBundles();

        setBundles(fetchedBundles);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error al obtener los bundles:', error);
      }
    };

    void fetchBundles();
  }, []);

  useEffect(() => {
    const fetchSupportedOperators = async () => {
      try {
        const fetchedOperators = await OperatorsService.getSupportedOperators();
        const sortedOperators = fetchedOperators.sort((a, b) => a.localeCompare(b));

        setSupportedOperators(sortedOperators);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error al obtener los operators:', error);
      }
    };

    void fetchSupportedOperators();
  }, []);

  const filteredBundles = bundles.filter(
    (bundle) =>
      bundle.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bundle.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (uiSettings?.bundlesSelected) {
      setSelectedBundles(
        uiSettings.bundlesSelected.reduce((acc, id) => ({ ...acc, [id]: true }), {}),
      );

      setBundleOperators(() => {
        const newSelection: string[] = [];
        bundles
          .filter((bundle) => uiSettings?.bundlesSelected?.includes(bundle.id ?? ''))
          .forEach((bundle) => {
            bundle.operators?.forEach((op) => {
              newSelection.push(op);
            });
          });

        return newSelection;
      });
    }
  }, [bundles, uiSettings?.bundlesSelected]);

  useEffect(() => {
    const newSelection: string[] = [];

    props.monitoredOperators?.forEach((operator) => {
      if (operator.operatorType === 'olm') {
        newSelection.push(operator.name ?? '');
      }
    });

    setSelectedOperators(newSelection);
  }, [props.monitoredOperators]);

  const handleBundleSelection = async (bundleId: string, operators: string[], checked: boolean) => {
    let bundlesSelected = uiSettings?.bundlesSelected ? [...uiSettings.bundlesSelected] : [];
    let newBundleOperators = [...bundleOperators];

    if (checked) {
      // Agregar el bundle si se marca
      bundlesSelected.push(bundleId);
      operators.forEach((op) => {
        if (!newBundleOperators.includes(op)) {
          newBundleOperators.push(op);
          const fieldId = mapOperatorsToFieldIds[op]; // Obtener el ID del campo correspondiente
          setFieldValue(fieldId, checked);
          if (op === OPERATOR_NAME_CNV || op === OPERATOR_NAME_ODF) {
            if (featureSupportLevelData.isFeatureSupported('LSO')) setFieldValue('useLso', checked);
          }
        }
      });
    } else {
      // Eliminar el bundle si se desmarca
      bundlesSelected = bundlesSelected.filter((id) => id !== bundleId);
      newBundleOperators = newBundleOperators.filter((op) => !operators.includes(op));
      operators.forEach((op) => {
        const fieldId = mapOperatorsToFieldIds[op]; // Obtener el ID del campo correspondiente
        setFieldValue(fieldId, checked);
        if (op === OPERATOR_NAME_CNV || op === OPERATOR_NAME_ODF) {
          if (featureSupportLevelData.isFeatureSupported('LSO')) setFieldValue('useLso', checked);
        }
      });
    }

    await updateUISettings({ bundlesSelected });

    setSelectedBundles((prev) => ({
      ...prev,
      [bundleId]: checked,
    }));

    setBundleOperators(newBundleOperators);
  };

  const getBundleLabel = (bundle: Bundle) => {
    let requirements: React.ReactElement | null = null;
    switch (bundle.id) {
      case 'virtualization':
        requirements = <VirtualizationRequirements />;
        break;
      case 'openshift-ai-nvidia':
        requirements = <OpenshiftAINvidiaRequirements />;
        break;
      case 'openshift-ai-amd':
        requirements = <OpenshiftAIAmdRequirements />;
        break;
    }

    return (
      <>
        <span>{bundle.title} </span>
        {requirements && (
          <PopoverIcon
            component={'a'}
            bodyContent={
              <>
                <span style={{ fontSize: '1.1em' }}>{'Requirements and dependencies'}</span>
                {requirements}
              </>
            }
          />
        )}
      </>
    );
  };

  const bundleHasOperatorsNotSupported = React.useCallback(
    (operators: string[] | undefined) => {
      return (
        operators?.some(
          (operator) =>
            !featureSupportLevelData.isFeatureSupported(mapOperatorIdToFeatureId[operator]),
        ) ?? false
      );
    },
    [featureSupportLevelData],
  );

  const getDisabledReasonForOperator = React.useCallback(
    (operatorKey: string, values: OperatorsValues) => {
      let disabledReason = featureSupportLevelData.getFeatureDisabledReason(
        mapOperatorIdToFeatureId[operatorKey],
      );
      if (operatorKey === 'cnv') {
        if (!disabledReason) {
          const lvmSupport = featureSupportLevelData.getFeatureSupportLevel('LVM');
          disabledReason = getCnvIncompatibleWithLvmReason(values, lvmSupport);
        }
        if (!disabledReason) {
          if (featureSupportLevelData.isFeatureSupported('MTV')) {
            disabledReason = getCnvDisabledWithMtvReason(values);
          }
        }
      }
      if (operatorKey === 'lvm') {
        if (!disabledReason) {
          const lvmSupport = featureSupportLevelData.getFeatureSupportLevel('LVM');
          disabledReason = getLvmIncompatibleWithCnvReason(values, lvmSupport);
          if (!disabledReason) {
            disabledReason = getLvmsIncompatibleWithOdfReason(values);
          }
        }
      }
      if (operatorKey === 'odf') {
        if (!disabledReason) {
          disabledReason = getOdfIncompatibleWithLvmsReason(values);
        }
      }
      if (operatorKey === 'openshift-ai') {
        if (!disabledReason) {
          disabledReason = getOpenShiftAIIncompatibleWithLvmsReason(values);
        }
      }
      return disabledReason;
    },
    [featureSupportLevelData],
  );

  const bundleHasOperatorsNotCompatibles = React.useCallback(
    (operators: string[] | undefined, values: OperatorsValues, isSelected: boolean) => {
      if (!isSelected) {
        return (
          operators?.some((operatorKey) => {
            const disabledReason = getDisabledReasonForOperator(operatorKey, values);
            console.log(disabledReason);
            return disabledReason !== undefined;
          }) ?? false
        );
      } else return false;
    },
    [getDisabledReasonForOperator],
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
          <FlexItem hidden>
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
        <Title headingLevel="h2" size="lg">
          Bundles
        </Title>
      </StackItem>
      {/* Mostrar bundles como tarjetas */}
      <Gallery hasGutter minWidths={{ default: '350px' }} maxWidths={{ default: '2fr' }}>
        {filteredBundles.map((bundle) => {
          const isSnoAndBlockedBundle =
            isSNO && (bundle.id === 'openshift-ai-nvidia' || bundle.id === 'openshift-ai-amd');
          const hasUnsupportedOperators = bundleHasOperatorsNotSupported(bundle.operators);
          const hasIncompatibleOperators = bundleHasOperatorsNotCompatibles(
            bundle.operators,
            values,
            bundle.id ? selectedBundles[bundle.id] : false,
          );
          const tooltipContent = hasUnsupportedOperators
            ? 'Some operators in this bundle are not supported with the current configuration.'
            : hasIncompatibleOperators
            ? 'Some operators in this bundle can not be installed with some single operators selected.'
            : isSnoAndBlockedBundle
            ? 'This bundle is not available when deploying a Single Node OpenShift.'
            : '';

          return (
            <GalleryItem key={bundle.id}>
              <Tooltip
                content={tooltipContent}
                hidden={
                  !hasUnsupportedOperators && !hasIncompatibleOperators && !isSnoAndBlockedBundle
                }
              >
                <Card
                  style={
                    bundle.id && selectedBundles[bundle.id]
                      ? { border: '1px solid #004080', height: '200px' }
                      : { height: '200px' }
                  }
                  isDisabled={
                    hasUnsupportedOperators || hasIncompatibleOperators || isSnoAndBlockedBundle
                  }
                >
                  <CardTitle
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getBundleLabel(bundle)}
                    </div>
                    <Checkbox
                      id={`bundle-${bundle.id || ''}`}
                      isChecked={bundle.id ? selectedBundles[bundle.id] : false}
                      onChange={(_event, checked) =>
                        void handleBundleSelection(bundle.id || '', bundle.operators || [], checked)
                      }
                      isDisabled={
                        hasUnsupportedOperators || hasIncompatibleOperators || isSnoAndBlockedBundle
                      }
                    />
                  </CardTitle>
                  <CardBody
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                    }}
                  >
                    <div>{bundle.description}</div>

                    {/* Badge aligned to the bottom-left */}
                    <div style={{ marginTop: '10px', alignSelf: 'flex-end', height: '25px' }}>
                      {(bundle.id === 'openshift-ai-nvidia' ||
                        bundle.id === 'openshift-ai-amd') && (
                        <NewFeatureSupportLevelBadge
                          featureId="OPENSHIFT_AI"
                          supportLevel="dev-preview"
                        />
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Tooltip>
            </GalleryItem>
          );
        })}
      </Gallery>
      <ExpandableSection
        toggleText={`Single Operators (${supportedOperators.length} | ${
          props.monitoredOperators
            ? numberOfEnabledOperators(props.monitoredOperators)
            : selectedOperators.length
        } selected)`}
        onToggle={() => setIsExpanded(!isExpanded)}
        isExpanded={isExpanded}
      >
        <Stack hasGutter data-testid={'operators-form'}>
          {supportedOperators.map((operatorKey) => {
            const isOperatorSelected = bundleOperators.includes(operatorKey);
            const isOperatorPartOfAIBundle =
              operatorsThatCanNotBeInstalledAlone.includes(operatorKey);
            const disabledReason = getDisabledReasonForOperator(operatorKey, values);
            const featureSupportLevel = featureSupportLevelData.getFeatureSupportLevel(
              mapOperatorIdToFeatureId[operatorKey],
            );
            const OperatorComponent = operatorComponentMap[operatorKey];
            if (!OperatorComponent) {
              return null;
            }
            return (
              <StackItem key={operatorKey}>
                <OperatorComponent
                  clusterId={props.clusterId}
                  openshiftVersion={props.openshiftVersion}
                  isVersionEqualsOrMajorThan4_15={isVersionEqualsOrMajorThan4_15}
                  isSNO={isSNO}
                  disabledReason={
                    isOperatorSelected
                      ? 'This operator is part of a bundle and cannot be deselected.'
                      : isOperatorPartOfAIBundle
                      ? 'This operator cannot be installed as a standalone'
                      : disabledReason
                  }
                  supportLevel={featureSupportLevel}
                />
              </StackItem>
            );
          })}
        </Stack>
      </ExpandableSection>
    </Stack>
  );
};
