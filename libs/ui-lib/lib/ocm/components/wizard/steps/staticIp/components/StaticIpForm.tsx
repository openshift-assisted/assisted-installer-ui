import React, { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { Form } from '@patternfly/react-core';
import { Formik, useFormikContext, yupToFormErrors } from 'formik';
import debouncer from 'lodash-es/debounce.js';
import isEqual from 'lodash-es/isEqual.js';
import { getApiErrorMessage, useAlerts, useErrorMonitor } from '../../../../../../common';
import { selectCurrentClusterPermissionsState } from '../../../../../store';
import { useFeature } from '../../../../../hooks';
import { getStaticNetworkConfig } from '../data/fromInfraEnv';
import { StaticIpFormProps, StaticIpFormState } from './propTypes';

const AUTOSAVE_DEBOUNCE_MS = 400;

type ValidateFn<StaticIpFormValues extends object> = (
  values: StaticIpFormValues,
) => Record<string, unknown>;

/**
 * Reports form state to the parent and persists on value changes.
 * Avoids Formik submitForm() for autosave: its async validation races with
 * onChange validation and can leave stale "A value is required" errors on filled fields.
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
  const {
    isSubmitting,
    isValid,
    touched,
    errors,
    values,
    initialValues,
    setErrors,
    setSubmitting,
  } = useFormikContext<StaticIpFormValues>();

  const isEmpty = React.useMemo(() => isEqual(values, emptyValues), [values, emptyValues]);
  const prevFormStateRef = React.useRef<StaticIpFormState>();
  const valuesRef = React.useRef(values);
  valuesRef.current = values;
  const saveGenerationRef = React.useRef(0);
  const [autoSaveIDs, setAutoSaveIDs] = React.useState<number[]>([]);
  const isAutoSaveRunning = !!autoSaveIDs.length;

  const persistRef = React.useRef<(valuesToSave: StaticIpFormValues, autoSaveID: number) => void>(
    () => undefined,
  );

  persistRef.current = (valuesToSave: StaticIpFormValues, autoSaveID: number) => {
    void (async () => {
      if (isViewerMode) {
        setAutoSaveIDs((ids) => ids.filter((id) => id > autoSaveID));
        return;
      }

      const generation = ++saveGenerationRef.current;
      const validationErrors = validate(valuesToSave);

      // Drop superseded validations so they cannot overwrite newer results with
      // stale "A value is required" errors after the user has filled the fields.
      if (generation !== saveGenerationRef.current || !isEqual(valuesToSave, valuesRef.current)) {
        setAutoSaveIDs((ids) => ids.filter((id) => id > autoSaveID));
        return;
      }

      setErrors(validationErrors as typeof errors);
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
    })();
  };

  const debouncedPersistRef = React.useRef(
    debouncer((valuesToSave: StaticIpFormValues, autoSaveID: number) => {
      persistRef.current(valuesToSave, autoSaveID);
    }, AUTOSAVE_DEBOUNCE_MS),
  );

  React.useEffect(() => {
    const commit = debouncedPersistRef.current;
    return () => commit.cancel();
  }, []);

  // Persist once on mount when form was opened with existing data.
  React.useEffect(() => {
    if (!isEqual(emptyValues, initialValues)) {
      const autoSaveID = Date.now();
      setAutoSaveIDs((ids) => [...ids, autoSaveID]);
      persistRef.current(initialValues, autoSaveID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: run only on mount.
  }, []);

  const prevValuesRef = React.useRef(values);
  React.useEffect(() => {
    if (!isEqual(prevValuesRef.current, values) && !isSubmitting) {
      // Sync validation keeps error state aligned with current values without the
      // async Formik onChange race that left stale required errors on filled fields.
      setErrors(validate(values) as typeof errors);
      const autoSaveID = Date.now();
      setAutoSaveIDs((ids) => [...ids, autoSaveID]);
      debouncedPersistRef.current(values, autoSaveID);
    }
    if (!isSubmitting) {
      prevValuesRef.current = values;
    }
  }, [values, isSubmitting, setErrors, validate]);

  React.useEffect(() => {
    const newFormState: StaticIpFormState = {
      isSubmitting,
      isAutoSaveRunning,
      isValid,
      touched,
      errors,
      isEmpty,
      values: values as Record<string, unknown>,
    };
    const prev = prevFormStateRef.current;
    if (
      prev?.isSubmitting !== isSubmitting ||
      prev?.isAutoSaveRunning !== isAutoSaveRunning ||
      prev?.isValid !== isValid ||
      prev?.isEmpty !== isEmpty ||
      !isEqual(prev?.errors, errors) ||
      !isEqual(prev?.touched, touched)
    ) {
      prevFormStateRef.current = newFormState;
      onFormStateChange(newFormState);
    }
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
    // validateOnChange is disabled: Formik's async onChange validation races with
    // itself and with autosave, leaving stale required errors on filled fields.
    // Autosave validates synchronously with a generation guard instead.
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={validate}
      validateOnMount
      validateOnChange={false}
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
