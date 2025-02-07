/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  mapOperatorsToFieldIds,
  operatorComponentMap,
} from '../clusterConfiguration/operators/SupportedOperators';
import { useClusterWizardContext } from './ClusterWizardContext';
import { useFormikContext } from 'formik';

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

        setSupportedOperators(fetchedOperators);
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

  const filteredOperators = Object.entries(operatorComponentMap)
    .map(([key, component]) => ({
      component: component,
      label: key,
    }))
    .filter((op) => op.label.toLowerCase().includes(searchTerm.toLowerCase()));

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
    if (!uiSettings?.bundlesSelected) {
      if (checked) await updateUISettings({ bundlesSelected: [bundleId] });
    } else {
      let bundlesSelected = [...uiSettings.bundlesSelected];

      if (checked) {
        // Agregar el bundle si se marca
        bundlesSelected.push(bundleId);
      } else {
        // Eliminar el bundle si se desmarca
        bundlesSelected = bundlesSelected.filter((id) => id !== bundleId);
      }

      await updateUISettings({ bundlesSelected });
    }

    setSelectedBundles((prev) => ({
      ...prev,
      [bundleId]: checked,
    }));

    if (checked) {
      setBundleOperators(() => {
        const newSelection: string[] = [];
        operators.forEach((op) => {
          const fieldId = mapOperatorsToFieldIds[op]; // Obtener el ID del campo correspondiente
          setFieldValue(fieldId, checked);
          newSelection.push(op);
        });
        return newSelection;
      });
    }
  };

  const getBundleLabel = (title: string | undefined, operators: string[] | undefined) => {
    return (
      <>
        <span>{title}</span>
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
          <FlexItem>
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
            <Card>
              <CardTitle>
                {getBundleLabel(bundle.title, bundle.operators)}
                <Checkbox
                  id={`bundle-${bundle.id || ''}`}
                  isChecked={bundle.id ? selectedBundles[bundle.id] : false}
                  onChange={(_event, checked) =>
                    void handleBundleSelection(bundle.id || '', bundle.operators || [], checked)
                  }
                  style={{ marginLeft: '140px' }}
                />
              </CardTitle>
              <CardBody>{bundle.description}</CardBody>
            </Card>
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
            // eslint-disable-next-line no-console
            console.log('Hola');
            console.log(operatorKey);
            console.log(bundleOperators);
            const isOperatorSelected = bundleOperators.includes(operatorKey);
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
                      ? 'You cannot disable this operator because it is part of a bundle'
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
