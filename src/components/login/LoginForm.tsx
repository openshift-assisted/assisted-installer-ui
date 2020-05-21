import React from 'react';
import { Formik, FormikHelpers, validateYupSchema, yupToFormErrors } from 'formik';
import {
  Form,
  Grid,
  GridItem,
  PageSectionVariants,
  TextContent,
  Text,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

import ClusterToolbar from '../clusters/ClusterToolbar';
import RedHatAccountFields from './RedHatAccountFields';
import PageSection from '../ui/PageSection';
import PullSecretFields from './PullSecretFields';
import { ToolbarButton, ToolbarText } from '../ui/Toolbar';
import validationSchema from './validationSchema';

interface LoginValues {
  username: string;
  password: string;
  pullSecret: string;
}

export interface CreateClusterFormState {
  providePullSecret: boolean;
}

const LoginForm: React.FC = () => {
  const [providePullSecret, setProvidePullSecret] = React.useState(false);

  const initialValues: LoginValues = {
    pullSecret: '',
    username: '',
    password: '',
  };

  const validate = (values: LoginValues) => {
    // NOTE(jtomasek): This allows passing context to Yup schema
    // https://github.com/jaredpalmer/formik/issues/506#issuecomment-372229014
    try {
      validateYupSchema<LoginValues>(values, validationSchema, true, {
        providePullSecret,
      });
    } catch (err) {
      return yupToFormErrors(err);
    }
    return {};
  };

  const handleSubmit = (values: LoginValues, formikActions: FormikHelpers<LoginValues>) => {
    // postInstallConfig(values)
    //   .then((response) => {
    //     // TODO(jtomasek): dispatch a success action
    //     console.log(response); // eslint-disable-line
    //     setCurrentStep(WizardStep.ManagedClusters);
    //     formikActions.setSubmitting(false);
    //   })
    //   .catch((e) => {
    //     console.log(e); // eslint-disable-line
    //     formikActions.setStatus({ error: e.message });
    //     formikActions.setSubmitting(false);
    //     // TODO(jtomasek): dispatch a failure action
    //   });
    return Promise.resolve().then(() => {
      // setCurrentStep(WizardStep.ManagedClusters);
      formikActions.setSubmitting(false);
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validate={validate}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit, isSubmitting, isValid, submitForm, status }) => (
        <>
          <PageSection variant={PageSectionVariants.light} isMain>
            <Grid gutter="md">
              <GridItem span={12} lg={10} xl={6}>
                <TextContent>
                  <Text component="h1">Connect to Red Hat Account </Text>
                </TextContent>
                <Form onSubmit={handleSubmit}>
                  {providePullSecret ? (
                    <PullSecretFields onProvideCredentials={() => setProvidePullSecret(false)} />
                  ) : (
                    <RedHatAccountFields onProvidePullSecret={() => setProvidePullSecret(true)} />
                  )}
                </Form>
              </GridItem>
            </Grid>
          </PageSection>
          <ClusterToolbar>
            <ToolbarButton
              variant="primary"
              onClick={submitForm}
              isDisabled={isSubmitting || !isValid}
            >
              Next
            </ToolbarButton>
            {isSubmitting && <ToolbarText>Form is being submitted</ToolbarText>}
            {status.error && (
              <ToolbarText>
                <ExclamationCircleIcon /> {status.error}
              </ToolbarText>
            )}
          </ClusterToolbar>
        </>
      )}
    </Formik>
  );
};

export default LoginForm;
