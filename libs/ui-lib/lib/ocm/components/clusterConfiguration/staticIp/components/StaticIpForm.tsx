import React, { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { Form } from '@patternfly/react-core';
import { Formik, FormikConfig, useFormikContext, yupToFormErrors } from 'formik';
import isEqual from 'lodash-es/isEqual.js';
import { useAlerts, useFormikAutoSave } from '../../../../../common';
import { useErrorMonitor } from '../../../../../common/components/ErrorHandling/ErrorMonitorContext';
import { getApiErrorMessage } from '../../../../../common/api';
import { StaticIpFormProps } from './propTypes';
import { selectCurrentClusterPermissionsState } from '../../../../store/slices/current-cluster/selectors';

const AutosaveWithParentUpdate = <StaticIpFormValues extends object>({
  onFormStateChange,
  getEmptyValues,
}: {
  onFormStateChange: StaticIpFormProps<StaticIpFormValues>['onFormStateChange'];
  getEmptyValues: StaticIpFormProps<StaticIpFormValues>['getEmptyValues'];
}) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const emptyValues = React.useMemo(() => getEmptyValues(), []);
  const { isSubmitting, isValid, touched, errors, values } = useFormikContext<StaticIpFormValues>();
  const isEmpty = React.useMemo<boolean>(() => {
    return isEqual(values, emptyValues);
  }, [values, emptyValues]);
  const isAutoSaveRunning = useFormikAutoSave();
  React.useEffect(() => {
    onFormStateChange({ isSubmitting, isAutoSaveRunning, isValid, touched, errors, isEmpty });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting, isValid, isAutoSaveRunning, touched, errors]);
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
  const [initialValues, setInitialValues] = React.useState<StaticIpFormValues | undefined>();
  React.useEffect(() => {
    if (showEmptyValues) {
      //after view changed the formik should be rendered with empty values
      setInitialValues(getEmptyValues());
    } else {
      setInitialValues(getInitialValues(infraEnv));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!initialValues) {
    return null;
  }

  const handleSubmit: FormikConfig<StaticIpFormValues>['onSubmit'] = async (values) => {
    clearAlerts();
    try {
      const staticNetworkConfig = getUpdateParams(infraEnv, values);
      await updateInfraEnv({
        staticNetworkConfig: staticNetworkConfig,
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

  const onSubmit = isViewerMode ? () => Promise.resolve() : handleSubmit;
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={validate}
      validateOnMount
      enableReinitialize
    >
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
