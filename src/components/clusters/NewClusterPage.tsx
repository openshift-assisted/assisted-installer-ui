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
  Stack,
  StackItem,
} from '@patternfly/react-core';
import PageSection from '../ui/PageSection';
import { ToolbarButton } from '../ui/Toolbar';
import ClusterToolbar from './ClusterToolbar';
import Alerts from '../ui/Alerts';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { AlertsContext, AlertsContextProvider } from '../AlertsContextProvider';
import ClusterBreadcrumbs from './ClusterBreadcrumbs';
import { routeBasePath } from '../../config/constants';
import { getClusters, postCluster } from '../../api/clusters';
import { ClusterCreateParams } from '../../api/types';
import { nameValidationSchema, validJSONSchema } from '../ui/formik/validationSchemas';
import InputField from '../ui/formik/InputField';
import LoadingState from '../ui/uiState/LoadingState';
import { captureException } from '../../sentry';
import { usePullSecretFetch } from '../fetching/pullSecret';
import PullSecret from './PullSecret';
import { useOpenshiftVersions } from '../fetching/openshiftVersions';
import { OpenshiftVersionOptionType } from '../../types/versions';
import SingleNodeCheckbox from '../ui/formik/SingleNodeCheckbox';
import OpenShiftVersionSelect from '../clusterConfiguration/OpenShiftVersionSelect';

type NewClusterFormProps = {
  pullSecret?: string;
  versions: OpenshiftVersionOptionType[];
};

const NewClusterForm: React.FC<NewClusterFormProps> = ({ pullSecret = '', versions }) => {
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
      <Formik
        initialValues={{
          name: '',
          openshiftVersion: versions[0]?.value,
          pullSecret: pullSecret,
          highAvailabilityMode: 'Full',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ submitForm, isSubmitting, isValid, dirty }) => (
          <Form
            className="form-new-cluster"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                submitForm();
              }
            }}
          >
            <Grid hasGutter>
              <GridItem span={12} lg={10} xl={6}>
                <Stack hasGutter>
                  <StackItem>
                    <InputField ref={nameInputRef} label="Cluster Name" name="name" isRequired />
                  </StackItem>
                  <StackItem>
                    <SingleNodeCheckbox name="highAvailabilityMode" versions={versions} />
                  </StackItem>
                  <StackItem>
                    <OpenShiftVersionSelect versions={versions} />
                  </StackItem>
                  <StackItem>
                    <PullSecret pullSecret={pullSecret} />
                  </StackItem>
                </Stack>
              </GridItem>
            </Grid>
            <Alerts />
            <ClusterToolbar>
              <ToolbarButton
                name="save"
                variant={ButtonVariant.primary}
                isDisabled={isSubmitting || !isValid || !dirty}
                onClick={submitForm}
                id="new-cluster-page-save"
              >
                Save & Continue
              </ToolbarButton>
              <ToolbarButton
                variant={ButtonVariant.link}
                onClick={() => history.push(`${routeBasePath}/clusters`)}
                id="new-cluster-page-cancel"
              >
                Cancel
              </ToolbarButton>
            </ClusterToolbar>
          </Form>
        )}
      </Formik>
    </>
  );
};

const NewCluster: React.FC = () => {
  const { addAlert } = React.useContext(AlertsContext);
  const pullSecret = usePullSecretFetch();
  const { error: errorOCPVersions, loading: loadingOCPVersions, versions } = useOpenshiftVersions();

  React.useEffect(() => errorOCPVersions && addAlert(errorOCPVersions), [
    errorOCPVersions,
    addAlert,
  ]);

  return (
    <>
      <ClusterBreadcrumbs clusterName="New cluster" />
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1">Install OpenShift on Bare Metal with the Assisted Installer</Text>
        </TextContent>
      </PageSection>
      <PageSection variant={PageSectionVariants.light} isFilled>
        {pullSecret === undefined || loadingOCPVersions ? (
          <LoadingState />
        ) : (
          <NewClusterForm pullSecret={pullSecret} versions={versions} />
        )}
      </PageSection>
    </>
  );
};

const NewClusterPage: React.FC = () => (
  <AlertsContextProvider>
    <NewCluster />
  </AlertsContextProvider>
);

export default NewClusterPage;
