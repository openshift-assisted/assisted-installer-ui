import React from 'react';
import * as Yup from 'yup';
import { Formik, FormikHelpers } from 'formik';
import { RouteComponentProps, Link } from 'react-router-dom';
import {
  Form,
  Grid,
  GridItem,
  PageSectionVariants,
  TextContent,
  Text,
  ButtonVariant,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import PageSection from '../ui/PageSection';
import { ToolbarButton } from '../ui/Toolbar';
import ClusterToolbar from './ClusterToolbar';
import AlertsSection from '../ui/AlertsSection';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { AlertsContext, AlertsContextProvider } from '../AlertsContextProvider';
import ClusterBreadcrumbs from './ClusterBreadcrumbs';
import {
  routeBasePath,
  OPENSHIFT_VERSION_OPTIONS,
  CLUSTER_MANAGER_SITE_LINK,
} from '../../config/constants';
import { getClusters, postCluster } from '../../api/clusters';
import { ClusterCreateParams } from '../../api/types';
import { nameValidationSchema, validJSONSchema } from '../ui/formik/validationSchemas';
import { ocmClient } from '../../api/axiosClient';
import InputField from '../ui/formik/InputField';
import SelectField from '../ui/formik/SelectField';
import TextAreaField from '../ui/formik/TextAreaField';
import LoadingState from '../ui/uiState/LoadingState';

const pullSecretHelperText = (
  <>
    The pull secret can be obtained from the Pull Secret page on the{' '}
    {
      <a href={CLUSTER_MANAGER_SITE_LINK} target="_blank" rel="noopener noreferrer">
        Red Hat OpenShift Cluster Manager site <ExternalLinkAltIcon />
      </a>
    }
    .
  </>
);

type NewClusterFormProps = RouteComponentProps & {
  pullSecret?: string;
};

const NewClusterForm: React.FC<NewClusterFormProps> = ({ history, pullSecret = '' }) => {
  const { addAlert, clearAlerts } = React.useContext(AlertsContext);

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
      console.error('Failed to perform unique cluster name validation.', e);
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
                  <Form>
                    <TextContent>
                      <Text component="h1">Configure a bare metal OpenShift cluster</Text>
                    </TextContent>
                    <InputField ref={nameInputRef} label="Cluster Name" name="name" isRequired />
                    <SelectField
                      label="OpenShift Version"
                      name="openshiftVersion"
                      options={OPENSHIFT_VERSION_OPTIONS}
                      isRequired
                    />
                    <TextAreaField
                      name="pullSecret"
                      label="Pull Secret"
                      getErrorText={(error) => (
                        <>
                          {error} {pullSecretHelperText}
                        </>
                      )}
                      helperText={pullSecretHelperText}
                      isRequired
                    />
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
                component={(props) => <Link to={`${routeBasePath}/clusters`} {...props} />}
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

const NewCluster: React.FC<RouteComponentProps> = (props) => {
  const [pullSecret, setPullSecret] = React.useState<string>();
  const { addAlert } = React.useContext(AlertsContext);

  React.useEffect(() => {
    const getPullSecret = async () => {
      if (ocmClient) {
        try {
          const response = await ocmClient.post('/api/accounts_mgmt/v1/access_token');
          setPullSecret(response?.request?.response || ''); // unmarshalled response as a string
        } catch (e) {
          handleApiError(e, (e) => {
            setPullSecret('');
            addAlert({ title: 'Failed to retrieve pull secret', message: getErrorMessage(e) });
          });
        }
      } else {
        setPullSecret('');
      }
    };
    getPullSecret();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (pullSecret === undefined) {
    return (
      <PageSection variant={PageSectionVariants.light} isMain>
        <LoadingState />
      </PageSection>
    );
  }
  return <NewClusterForm pullSecret={pullSecret} {...props} />;
};

const NewClusterPage: React.FC<RouteComponentProps> = (props) => (
  <AlertsContextProvider>
    <NewCluster {...props} />
  </AlertsContextProvider>
);

export default NewClusterPage;
