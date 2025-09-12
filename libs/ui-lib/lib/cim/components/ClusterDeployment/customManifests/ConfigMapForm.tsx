import React from 'react';
import Fuse from 'fuse.js';
import { FieldArray, useFormikContext } from 'formik';
import {
  Stack,
  StackItem,
  Grid,
  WizardFooter,
  useWizardContext,
  useWizardFooter,
  SelectOptionProps,
  GridItem,
  AlertVariant,
  Alert,
} from '@patternfly/react-core';
import { Alerts, SelectFieldWithSearch, useAlerts, useTranslation } from '../../../../common';
import { ClusterDeploymentWizardContext } from '../ClusterDeploymentWizardContext';
import { ValidationSection } from '../components/ValidationSection';
import { ConfigMapDetail } from './ConfigMapDetail';
import { useConfigMaps } from '../../../hooks';

const NO_RESULTS = 'no_results';

export type CustomManifestFormType = {
  configMaps: {
    name: string;
    valid: boolean;
    manifestNames?: string[];
  }[];
};

export const ConfigMapForm = ({ namespace }: { namespace: string }) => {
  const { t } = useTranslation();
  const { syncError } = React.useContext(ClusterDeploymentWizardContext);
  const { alerts, addAlert, clearAlerts } = useAlerts();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const { activeStep, goToPrevStep, goToNextStep, close } = useWizardContext();

  const { values, errors, isValid, setFieldValue, submitForm } =
    useFormikContext<CustomManifestFormType>();
  const [filter, setFilter] = React.useState<string>('');
  const [configMaps, setConfigMaps] = React.useState<SelectOptionProps[]>([]);
  const [data, loaded, isError] = useConfigMaps({
    namespace,
    isList: true,
  });

  React.useEffect(() => {
    if (data && loaded && !isError) {
      setConfigMaps(
        data.map((configMap) => ({
          value: {
            name: configMap.metadata?.name as string,
            valid: true,
            manifestNames: Object.keys(configMap.data || {}),
          },
          children: configMap.metadata?.name as string,
        })),
      );
    }
  }, [data, isError, loaded]);

  React.useEffect(() => {
    if (loaded && !isError) {
      const newConfigMaps = values.configMaps.map((configMap) => {
        const map = data.find((item) => item.metadata?.name === configMap.name);
        if (map) {
          return { ...configMap, valid: true, manifestNames: Object.keys(map.data || {}) };
        }
        return { ...configMap, valid: false, manifestNames: [] };
      });

      setFieldValue('configMaps', newConfigMaps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isError, loaded, setFieldValue]);

  const placeholder = React.useMemo(() => {
    if (values.configMaps.length > 0) {
      return `${values.configMaps.length} config map${
        values.configMaps.length !== 1 ? 's' : ''
      } selected`;
    }

    return 'No config map selected';
  }, [values.configMaps]);

  const fuse = React.useMemo(
    () =>
      new Fuse(Object.values(configMaps), {
        includeScore: true,
        ignoreLocation: true,
        threshold: 0.3,
        keys: ['value.name'],
      }),
    [configMaps],
  );

  const selectOptions = React.useMemo(() => {
    if (filter) {
      const newSelectOptions = fuse
        .search(filter)
        .sort((a, b) => (a.score || 0) - (b.score || 0))
        .map(({ item }) => item);

      if (!newSelectOptions.length) {
        return [
          {
            isAriaDisabled: true,
            children: t('ai:No results found for {{filter}}', { filter }),
            value: NO_RESULTS,
            hasCheckbox: false,
          },
        ];
      }
      return newSelectOptions;
    }
    return configMaps;
  }, [filter, configMaps, fuse, t]);

  const submittingText = React.useMemo(() => {
    if (isSubmitting) {
      return t('ai:Saving changes...');
    }
    return undefined;
  }, [isSubmitting, t]);

  const onNext = React.useCallback(async () => {
    try {
      clearAlerts();
      setSubmitting(true);

      await submitForm();
      await goToNextStep();
    } catch (error) {
      addAlert({
        title: t('ai:Failed to save ClusterDeployment'),
        message: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }, [addAlert, clearAlerts, goToNextStep, submitForm, t]);

  const footer = React.useMemo(
    () => (
      <WizardFooter
        activeStep={activeStep}
        onNext={onNext}
        nextButtonProps={{ isLoading: !!submittingText }}
        nextButtonText={submittingText || t('ai:Next')}
        isNextDisabled={!isValid || !loaded}
        onBack={goToPrevStep}
        onClose={close}
      />
    ),
    [activeStep, onNext, submittingText, t, isValid, loaded, goToPrevStep, close],
  );

  useWizardFooter(footer);

  const errorAlert =
    typeof errors.configMaps === 'string' ? (
      <GridItem>
        <Alert variant={AlertVariant.danger} title={errors.configMaps} isInline />
      </GridItem>
    ) : (
      <GridItem>
        <Alert
          variant={AlertVariant.danger}
          title={t('ai:Some config map items are invalid')}
          isInline
        />
      </GridItem>
    );

  return (
    <Grid hasGutter>
      <GridItem>
        <Stack hasGutter>
          <StackItem>
            <SelectFieldWithSearch
              name={'configMaps'}
              label={t('ai:Config maps')}
              isMultiSelect
              isRequired
              isLoading={!loaded}
              selectOptions={selectOptions}
              filterValue={filter}
              setFilterValue={setFilter}
              placeholder={placeholder}
              helperText={t(
                'ai:Select config maps from the list or use the type ahead to narrow down the list.',
              )}
            />
          </StackItem>
          <StackItem>
            <Grid hasGutter>
              <FieldArray name="configMaps">
                {({ remove }) =>
                  values.configMaps.map((configMap, index) => (
                    <ConfigMapDetail
                      index={index}
                      key={configMap.name}
                      configMapName={configMap.name}
                      configMap={data.find((item) => item.metadata?.name === configMap.name)}
                      onRemove={() => remove(index)}
                      isLoading={!loaded}
                    />
                  ))
                }
              </FieldArray>
            </Grid>
          </StackItem>
        </Stack>
      </GridItem>

      {!isValid && errorAlert}

      {isError && (
        <GridItem>
          <Alert
            variant={AlertVariant.danger}
            title={t('ai:An error occurred while fetching config maps')}
            isInline
          />
        </GridItem>
      )}

      {!!alerts.length && (
        <GridItem>
          <Alerts />
        </GridItem>
      )}

      {syncError && (
        <GridItem>
          <ValidationSection currentStepId={'custom-manifests'} hosts={[]}>
            <Alert variant={AlertVariant.danger} title={t('ai:An error occurred')} isInline>
              {syncError}
            </Alert>
          </ValidationSection>
        </GridItem>
      )}
    </Grid>
  );
};
