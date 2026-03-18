import React, { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { Form } from '@patternfly/react-core';
import { Formik, useFormikContext, yupToFormErrors } from 'formik';
import isEqual from 'lodash-es/isEqual.js';
import { useAlerts, useFormikAutoSave } from '../../../../../common';
import { useErrorMonitor } from '../../../../../common/components/ErrorHandling/ErrorMonitorContext';
import { getApiErrorMessage } from '../../../../../common/api';
import { StaticIpFormProps } from './propTypes';
import { selectCurrentClusterPermissionsState } from '../../../../store/slices/current-cluster/selectors';

/** Reports form state and triggers save on every value change (useFormikAutoSave) */
const AutosaveWithParentUpdate = <StaticIpFormValues extends object>({
  onFormStateChange,
  getEmptyValues,
}: {
  onFormStateChange: StaticIpFormProps<StaticIpFormValues>['onFormStateChange'];
  getEmptyValues: StaticIpFormProps<StaticIpFormValues>['getEmptyValues'];
}) => {
  const emptyValues = React.useMemo(() => getEmptyValues(), [getEmptyValues]);
  const { isSubmitting, isValid, touched, errors, values, initialValues, submitForm } =
    useFormikContext<StaticIpFormValues>();

  const isEmpty = React.useMemo(() => isEqual(values, emptyValues), [values, emptyValues]);
  const isAutoSaveRunning = useFormikAutoSave(0);

  // Submit once on mount when form was opened with existing data (so it gets persisted).
  React.useEffect(() => {
    if (!isEqual(emptyValues, initialValues)) {
      void submitForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: run only on mount.
  }, []);

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
  const initialValues = showEmptyValues ? getEmptyValues() : getInitialValues(infraEnv);

  const handleSubmit = async (values: StaticIpFormValues) => {
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
  };

  const validate = (values: StaticIpFormValues) => {
    try {
      validationSchema.validateSync(values, {
        abortEarly: false,
        context: { values },
      });
      return {};
    } catch (error) {
      return yupToFormErrors(error);
    }
  };

  if (!initialValues) {
    return null;
  }

  const onSubmit = isViewerMode ? () => Promise.resolve() : handleSubmit;
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validate={validate} validateOnMount>
      <Form>
        {children}
        <AutosaveWithParentUpdate<StaticIpFormValues>
          onFormStateChange={onFormStateChange}
          getEmptyValues={getEmptyValues}
        />
      </Form>
    </Formik>
  );
};
