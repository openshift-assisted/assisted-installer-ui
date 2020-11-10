import React from 'react';
import * as Yup from 'yup';
import { Formik, FormikHelpers } from 'formik';
import { useHistory } from 'react-router-dom';
import {
  Form,
  Grid,
  GridItem,
  PageSectionVariants,
  TextContent,
  Text,
  ButtonVariant,
} from '@patternfly/react-core';
import PageSection from '../ui/PageSection';
import { ToolbarButton } from '../ui/Toolbar';
import ClusterToolbar from './ClusterToolbar';
import AlertsSection from '../ui/AlertsSection';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { AlertsContext, AlertsContextProvider } from '../AlertsContextProvider';
import ClusterBreadcrumbs from './ClusterBreadcrumbs';
import { routeBasePath, OPENSHIFT_VERSION_OPTIONS } from '../../config/constants';
import { getClusters, postCluster } from '../../api/clusters';
import { ClusterCreateParams } from '../../api/types';
import { nameValidationSchema, validJSONSchema } from '../ui/formik/validationSchemas';
import InputField from '../ui/formik/InputField';
import SelectField from '../ui/formik/SelectField';
import LoadingState from '../ui/uiState/LoadingState';
import { captureException } from '../../sentry';
import PullSecret from './PullSecret';
import { usePullSecretFetch } from '../fetching/pullSecret';

import './NewClusterPage.css';

type NewClusterFormProps = {
  pullSecret?: string;
};

const NewClusterForm: React.FC<NewClusterFormProps> = ({ pullSecret = '' }) => {
  const { addAlert, clearAlerts } = React.useContext(AlertsContext);
  const history = useHistory();

  const nameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const validationSchema = React.useCallback(
    () =>
      Yup.object({
        name: nameValidationSchema,
        openshiftVersion: Yup.string().required('Required'),
        pullSecret: validJSONSchema.required('Pull secret must be provided.'),
      }),
    [],
  );

  const handleSubmit = async (
    values: ClusterCreateParams,
    formikActions: FormikHelpers<ClusterCreateParams>,
  ) => {
    clearAlerts();

    // async validation for cluster name - run only on submit
    try {
      const { data: clusters } = await getClusters();
      const names = clusters.map((c) => c.name);
      if (names.includes(values.name)) {
        return formikActions.setFieldError('name', `Name "${values.name}" is already taken.`);
      }
    } catch (e) {
      captureException(e, 'Failed to perform unique cluster name validation.');
    }

    try {
      const { data } = await postCluster(values);
      history.push(`${routeBasePath}/clusters/${data.id}`);
    } catch (e) {
      handleApiError<ClusterCreateParams>(e, () =>
        addAlert({ title: 'Failed to create new cluster', message: getErrorMessage(e) }),
      );
    }
  };

  return (
    <>
      <ClusterBreadcrumbs clusterName="New cluster" />
      <Formik
        initialValues={{
          name: '',
          openshiftVersion: OPENSHIFT_VERSION_OPTIONS[0].value,
          pullSecret: pullSecret,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ submitForm, isSubmitting, isValid, dirty }) => (
          <>
            <PageSection variant={PageSectionVariants.light} isMain>
              <Grid hasGutter>
                <GridItem span={12} lg={10} xl={6}>
                  <Form className="form-new-cluster">
                    <TextContent>
                      <Text component="h1">
                        Install OpenShift on Bare Metal with the Assisted Installer
                      </Text>
                    </TextContent>
                    <InputField ref={nameInputRef} label="Cluster Name" name="name" isRequired />
                    <SelectField
                      label="OpenShift Version"
                      name="openshiftVersion"
                      options={OPENSHIFT_VERSION_OPTIONS}
                      isRequired
                    />
                    <PullSecret pullSecret={pullSecret} />
                  </Form>
                </GridItem>
              </Grid>
            </PageSection>
            <AlertsSection />
            <ClusterToolbar>
              <ToolbarButton
                name="save"
                variant={ButtonVariant.primary}
                isDisabled={isSubmitting || !isValid || !dirty}
                onClick={submitForm}
              >
                Save & Continue
              </ToolbarButton>
              <ToolbarButton
                variant={ButtonVariant.link}
                onClick={() => history.push(`${routeBasePath}/clusters`)}
              >
                Cancel
              </ToolbarButton>
            </ClusterToolbar>
          </>
        )}
      </Formik>
    </>
  );
};

const NewCluster: React.FC = () => {
  const pullSecret = usePullSecretFetch();
  if (pullSecret === undefined) {
    return (
      <PageSection variant={PageSectionVariants.light} isMain>
        <LoadingState />
      </PageSection>
    );
  }
  return <NewClusterForm pullSecret={pullSecret} />;
};

const NewClusterPage: React.FC = () => (
  <AlertsContextProvider>
    <NewCluster />
  </AlertsContextProvider>
);

export default NewClusterPage;
