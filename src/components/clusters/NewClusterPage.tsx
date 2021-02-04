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
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import AlertsSection from '../ui/AlertsSection';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { AlertsContext, AlertsContextProvider } from '../AlertsContextProvider';
import ClusterBreadcrumbs from './ClusterBreadcrumbs';
import { routeBasePath } from '../../config/constants';
import { getClusters, postCluster } from '../../api/clusters';
import { ClusterCreateParams } from '../../api/types';
import { nameValidationSchema, validJSONSchema } from '../ui/formik/validationSchemas';
import InputField from '../ui/formik/InputField';
import SelectField from '../ui/formik/SelectField';
import LoadingState from '../ui/uiState/LoadingState';
import { captureException } from '../../sentry';
import { usePullSecretFetch } from '../fetching/pullSecret';
import PullSecret from './PullSecret';
import { useOpenshiftVersions } from '../fetching/openshiftVersions';
import { OpenshiftVersionOptionType } from '../../types/versions';
import SingleNodeCheckbox from '../ui/formik/SingleNodeCheckbox';
import {
  FeatureGateContextProvider,
  FeatureListType,
  useFeature,
} from '../../features/featureGate';

import './NewClusterPage.css';

type NewClusterFormProps = {
  pullSecret?: string;
  versions: OpenshiftVersionOptionType[];
};

const NewClusterForm: React.FC<NewClusterFormProps> = ({ pullSecret = '', versions }) => {
  const { addAlert, clearAlerts } = React.useContext(AlertsContext);
  const isSingleNodeOpenshiftEnabled = useFeature('ASSISTED_INSTALLER_SNO_FEATURE');
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

  const getOpenshiftVersionHelperText = (value: string) =>
    versions.find((version) => version.value === value)?.supportLevel !== 'production' ? (
      <>
        <ExclamationTriangleIcon color={warningColor.value} size="sm" />
        &nbsp;Please note that this version is not production ready.
      </>
    ) : null;

  const ocpVersionOptions = versions.map((version) => ({
    label: version.label,
    value: version.value,
  }));

  return (
    <>
      <ClusterBreadcrumbs clusterName="New cluster" />
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
          <>
            <PageSection variant={PageSectionVariants.light} isMain>
              <Grid hasGutter>
                <GridItem span={12} lg={10} xl={6}>
                  <Form
                    className="form-new-cluster"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        submitForm();
                      }
                    }}
                  >
                    <TextContent>
                      <Text component="h1">
                        Install OpenShift on Bare Metal with the Assisted Installer
                      </Text>
                    </TextContent>
                    <InputField ref={nameInputRef} label="Cluster Name" name="name" isRequired />
                    {isSingleNodeOpenshiftEnabled && (
                      <SingleNodeCheckbox name="highAvailabilityMode" />
                    )}
                    <SelectField
                      label="OpenShift Version"
                      name="openshiftVersion"
                      options={ocpVersionOptions}
                      getHelperText={getOpenshiftVersionHelperText}
                      isDisabled={versions.length === 0}
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
          </>
        )}
      </Formik>
    </>
  );
};

const NewCluster: React.FC = () => {
  const { addAlert } = React.useContext(AlertsContext);
  const pullSecret = usePullSecretFetch();
  const { error: errorOCPVersions, loading: loadingOCPVersions, versions } = useOpenshiftVersions();

  // Loading errors will be rendered by a subcomponent
  React.useEffect(() => errorOCPVersions && addAlert(errorOCPVersions), [
    errorOCPVersions,
    addAlert,
  ]);

  if (pullSecret === undefined || loadingOCPVersions) {
    return (
      <PageSection variant={PageSectionVariants.light} isMain>
        <LoadingState />
      </PageSection>
    );
  }

  return <NewClusterForm pullSecret={pullSecret} versions={versions} />;
};

const NewClusterPage: React.FC<{ features: FeatureListType }> = ({ features }) => (
  <AlertsContextProvider>
    <FeatureGateContextProvider features={features}>
      <NewCluster />
    </FeatureGateContextProvider>
  </AlertsContextProvider>
);

export default NewClusterPage;
