import { Form } from '@patternfly/react-core';
import { Formik, FormikConfig, useFormikContext } from 'formik';
import isEqual from 'lodash/isEqual';
import React, { PropsWithChildren } from 'react';
import { ErrorState, useAlerts } from '../../../../../common';
import { useFormikAutoSave } from '../../../../../common/components/ui/formik/FormikAutoSave';
import { useErrorHandler } from '../../../../../common/errorHandling/ErrorHandlerContext';
import { StaticIpFormProps } from './propTypes';

const AutosaveWithParentUpdate = <StaticIpFormValues,>({
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

export const StaticIpForm = <StaticIpFormValues,>({
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
  const { clearAlerts } = useAlerts();
  const { handleError, handleApiError } = useErrorHandler();
  const [initialValues, setInitialValues] = React.useState<StaticIpFormValues | undefined>();
  const [errorMsg, setErrorMsg] = React.useState<string>();
  React.useEffect(() => {
    try {
      if (showEmptyValues) {
        //after view changed the formik should be rendered with empty values
        setInitialValues(getEmptyValues());
      } else {
        setInitialValues(getInitialValues(infraEnv));
      }
    } catch (error) {
      const msg = `Failed to get initial values from infra env ${infraEnv.id}`;
      handleError({
        error: error,
        message: msg,
        showAlert: false,
      });
      setErrorMsg(msg);
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleError]);

  const handleSubmit: FormikConfig<StaticIpFormValues>['onSubmit'] = async (values) => {
    clearAlerts();
    try {
      const staticNetworkConfig = getUpdateParams(infraEnv, values);
      await updateInfraEnv({
        staticNetworkConfig: staticNetworkConfig,
      });
    } catch (error) {
      handleApiError({ error });
    }
  };
  if (errorMsg) {
    return <ErrorState title="Parsing error" content={errorMsg} />;
  }
  if (!initialValues) {
    return null;
  }
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
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
