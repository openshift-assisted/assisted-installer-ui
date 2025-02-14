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
  const { setFieldValue } = useFormikContext<OperatorsValues>();
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
        }
      });
    } else {
      // Eliminar el bundle si se desmarca
      bundlesSelected = bundlesSelected.filter((id) => id !== bundleId);
      newBundleOperators = newBundleOperators.filter((op) => !operators.includes(op));
      operators.forEach((op) => {
        const fieldId = mapOperatorsToFieldIds[op]; // Obtener el ID del campo correspondiente
        setFieldValue(fieldId, checked);
      });
    }

    await updateUISettings({ bundlesSelected });

    setSelectedBundles((prev) => ({
      ...prev,
      [bundleId]: checked,
    }));

    setBundleOperators(newBundleOperators);
  };

  const getBundleLabel = (title: string | undefined, operators: string[] | undefined) => {
    return (
      <>
        <span>{title} </span>
        <PopoverIcon
          component={'a'}
          bodyContent={
            <>
              <h3>{'Bundle operators'}</h3>
              {operators && operators.length > 0 ? (
                <ul>
                  {operators.map((operator, index) => (
                    <li key={index}>{operator}</li>
                  ))}
                </ul>
              ) : (
                <p>No operators available</p>
              )}
            </>
          }
        />
      </>
    );
  };
  const bundleHasOperatorsNotSupported = (operators: string[] | undefined) => {
    return (
      operators?.some(
        (operator) =>
          !featureSupportLevelData.isFeatureSupported(mapOperatorIdToFeatureId[operator]),
      ) ?? false
    );
  };

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
        {filteredBundles.map((bundle) => (
          <GalleryItem key={bundle.id}>
            <Tooltip
              content="Some operators in this bundle are not supported with the current configuration"
              hidden={!bundleHasOperatorsNotSupported(bundle.operators)}
            >
              <Card
                style={
                  bundle.id && selectedBundles[bundle.id]
                    ? { border: '1px solid #004080', height: '200px' }
                    : { height: '200px' }
                }
                isDisabled={bundleHasOperatorsNotSupported(bundle.operators)}
              >
                <CardTitle
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getBundleLabel(bundle.title, bundle.operators)}
                  </div>
                  <Checkbox
                    id={`bundle-${bundle.id || ''}`}
                    isChecked={bundle.id ? selectedBundles[bundle.id] : false}
                    onChange={(_event, checked) =>
                      void handleBundleSelection(bundle.id || '', bundle.operators || [], checked)
                    }
                    isDisabled={bundleHasOperatorsNotSupported(bundle.operators)}
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
                    {bundle.id === 'openshift-ai-nvidia' && (
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
        ))}
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
                      : ''
                  }
                />
              </StackItem>
            );
          })}
        </Stack>
      </ExpandableSection>
    </Stack>
  );
};
