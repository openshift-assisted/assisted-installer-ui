import React, { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { Form } from '@patternfly/react-core';
import { Formik, useFormikContext, yupToFormErrors } from 'formik';
import isEqual from 'lodash-es/isEqual.js';
import { getApiErrorMessage, useAlerts, useErrorMonitor } from '../../../../../../common';
import { selectCurrentClusterPermissionsState } from '../../../../../store';
import { useFeature } from '../../../../../hooks';
import { getStaticNetworkConfig } from '../data/fromInfraEnv';
import { StaticIpFormProps } from './propTypes';

type ValidateFn<StaticIpFormValues extends object> = (
  values: StaticIpFormValues,
) => Record<string, unknown>;

/**
 * Reports form state to the parent and persists on value changes.
 * Saves via onSave directly (not submitForm) so Formik's validateOnChange
 * remains the sole validation pipeline — avoiding the race that left stale
 * "A value is required" errors on filled fields.
 */
const AutosaveWithParentUpdate = <StaticIpFormValues extends object>({
  onFormStateChange,
  getEmptyValues,
  onSave,
  validate,
  isViewerMode,
}: {
  onFormStateChange: StaticIpFormProps<StaticIpFormValues>['onFormStateChange'];
  getEmptyValues: StaticIpFormProps<StaticIpFormValues>['getEmptyValues'];
  onSave: (values: StaticIpFormValues) => Promise<void>;
  validate: ValidateFn<StaticIpFormValues>;
  isViewerMode: boolean;
}) => {
  const emptyValues = React.useMemo(() => getEmptyValues(), [getEmptyValues]);
  const { isSubmitting, isValid, touched, errors, values, initialValues, setSubmitting } =
    useFormikContext<StaticIpFormValues>();

  const isEmpty = React.useMemo(() => isEqual(values, emptyValues), [values, emptyValues]);
  const [autoSaveIDs, setAutoSaveIDs] = React.useState<number[]>([]);
  const isAutoSaveRunning = !!autoSaveIDs.length;
  const valuesRef = React.useRef(values);
  valuesRef.current = values;
  const saveGenerationRef = React.useRef(0);

  const persist = React.useCallback(
    async (valuesToSave: StaticIpFormValues, autoSaveID: number) => {
      if (isViewerMode) {
        setAutoSaveIDs((ids) => ids.filter((id) => id > autoSaveID));
        return;
      }

      const generation = ++saveGenerationRef.current;
      const validationErrors = validate(valuesToSave);

      // Drop superseded saves so an older validation cannot persist stale data.
      if (generation !== saveGenerationRef.current || !isEqual(valuesToSave, valuesRef.current)) {
        setAutoSaveIDs((ids) => ids.filter((id) => id > autoSaveID));
        return;
      }

      if (Object.keys(validationErrors).length > 0) {
        setAutoSaveIDs((ids) => ids.filter((id) => id > autoSaveID));
        return;
      }

      setSubmitting(true);
      try {
        await onSave(valuesToSave);
      } finally {
        if (generation === saveGenerationRef.current) {
          setSubmitting(false);
        }
        setAutoSaveIDs((ids) => ids.filter((id) => id > autoSaveID));
      }
    },
    [isViewerMode, onSave, validate, setSubmitting],
  );

  // Persist once on mount when form was opened with existing data.
  React.useEffect(() => {
    if (!isEqual(emptyValues, initialValues)) {
      const autoSaveID = Date.now();
      setAutoSaveIDs((ids) => [...ids, autoSaveID]);
      void persist(initialValues, autoSaveID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: run only on mount.
  }, []);

  const prevValuesRef = React.useRef(values);
  React.useEffect(() => {
    if (!isEqual(prevValuesRef.current, values) && !isSubmitting) {
      const autoSaveID = Date.now();
      setAutoSaveIDs((ids) => [...ids, autoSaveID]);
      void persist(values, autoSaveID);
    }
    if (!isSubmitting) {
      prevValuesRef.current = values;
    }
  }, [values, isSubmitting, persist]);

  React.useEffect(() => {
    onFormStateChange({
      isSubmitting,
      isAutoSaveRunning,
      isValid,
      touched,
      errors,
      isEmpty,
      values: values as Record<string, unknown>,
    });
  }, [
    isSubmitting,
    isValid,
    isAutoSaveRunning,
    touched,
    errors,
    values,
    isEmpty,
    onFormStateChange,
  ]);
  return null;
};

export const StaticIpForm = <StaticIpFormValues extends object>({
  infraEnv,
  updateInfraEnv,
  getInitialValues,
  getUpdateParams,
  validationSchema,
  onFormStateChange,
  getEmptyValues,
  children,
  showEmptyValues,
}: PropsWithChildren<StaticIpFormProps<StaticIpFormValues>>) => {
  const { clearAlerts, addAlert } = useAlerts();
  const { captureException } = useErrorMonitor();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const prefillFromInfraEnv = isSingleClusterFeatureEnabled && !!getStaticNetworkConfig(infraEnv);
  const initialValues = React.useMemo(() => {
    if (showEmptyValues && !prefillFromInfraEnv) {
      return getEmptyValues();
    }
    return getInitialValues(infraEnv);
  }, [showEmptyValues, prefillFromInfraEnv, infraEnv, getInitialValues, getEmptyValues]);

  const handleSubmit = React.useCallback(
    async (values: StaticIpFormValues) => {
      clearAlerts();
      try {
        await updateInfraEnv({
          staticNetworkConfig: getUpdateParams(infraEnv, values),
        });
      } catch (error) {
        captureException(error);
        addAlert({
          title: 'Failed to update the static network config',
          message: getApiErrorMessage(error),
        });
      }
    },
    [clearAlerts, updateInfraEnv, getUpdateParams, infraEnv, captureException, addAlert],
  );

  const validate = React.useCallback(
    (values: StaticIpFormValues) => {
      try {
        validationSchema.validateSync(values, {
          abortEarly: false,
          context: { values },
        });
        return {};
      } catch (error) {
        return yupToFormErrors(error);
      }
    },
    [validationSchema],
  );

  if (!initialValues) {
    return null;
  }

  const onSubmit = isViewerMode ? () => Promise.resolve() : handleSubmit;
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={validate}
      validateOnMount={!showEmptyValues}
    >
      <Form>
        {children}
        <AutosaveWithParentUpdate<StaticIpFormValues>
          onFormStateChange={onFormStateChange}
          getEmptyValues={getEmptyValues}
          onSave={handleSubmit}
          validate={validate}
          isViewerMode={isViewerMode}
        />
      </Form>
    </Formik>
  );
};
