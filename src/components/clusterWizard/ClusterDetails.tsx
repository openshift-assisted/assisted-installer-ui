import React from 'react';
import * as Yup from 'yup';
import _ from 'lodash';
import { Formik, FormikHelpers } from 'formik';
import { Cluster, ClusterUpdateParams, ManagedDomain } from '../../api/types';
import ClusterWizardStep from './ClusterWizardStep';
import {
  dnsNameValidationSchema,
  nameValidationSchema,
  validJSONSchema,
} from '../ui/formik/validationSchemas';
import {
  ButtonVariant,
  Form,
  Grid,
  GridItem,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextContent,
} from '@patternfly/react-core';
import InputField from '../ui/formik/InputField';
import SelectField from '../ui/formik/SelectField';
import PullSecret from '../clusters/PullSecret';
import { routeBasePath } from '../../config/constants';
import ClusterToolbar from '../clusters/ClusterToolbar';
import ToolbarButton from '../ui/Toolbar/ToolbarButton';
import { useHistory } from 'react-router-dom';
import LoadingState from '../ui/uiState/LoadingState';
import { usePullSecretFetch } from '../fetching/pullSecret';
import { captureException } from '../../sentry';
import { ClusterDetailsValues } from '../../types/clusters';
import { getClusters, patchCluster } from '../../api/clusters';
import { getErrorMessage, handleApiError } from '../../api/utils';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import { useDispatch } from 'react-redux';
import { AlertsContext } from '../AlertsContextProvider';
import ClusterWizardContext from './ClusterWizardContext';
import Alerts from '../ui/Alerts';
import CheckboxField from '../ui/formik/CheckboxField';
import { getManagedDomains } from '../../api/domains';
import ToolbarText from '../ui/Toolbar/ToolbarText';
import { canNextClusterDetails } from './wizardTransition';

type ClusterDetailsFormProps = {
  cluster: Cluster;
  pullSecret: string;
  managedDomains: ManagedDomain[];
};

const ClusterDetailsForm: React.FC<ClusterDetailsFormProps> = ({
  cluster,
  pullSecret,
  managedDomains,
}) => {
  const { alerts, addAlert, clearAlerts } = React.useContext(AlertsContext);
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const history = useHistory();
  const dispatch = useDispatch();
  const nameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);
  const { name, openshiftVersion = '', pullSecretSet, baseDnsDomain } = cluster;

  const initialValues = {
    name,
    openshiftVersion,
    pullSecret,
    baseDnsDomain,
    useRedHatDnsService:
      !!baseDnsDomain && managedDomains.map((d) => d.domain).includes(baseDnsDomain),
  };

  const validationSchema = React.useCallback(
    () =>
      Yup.object({
        name: nameValidationSchema,
        openshiftVersion: Yup.string().required('Required'),
        pullSecret: pullSecretSet
          ? validJSONSchema
          : validJSONSchema.required('Pull secret must be provided.'),
        baseDnsDomain: dnsNameValidationSchema(initialValues.baseDnsDomain),
      }),
    [initialValues.baseDnsDomain, pullSecretSet],
  );

  const handleSubmit = async (
    values: ClusterDetailsValues,
    formikActions: FormikHelpers<ClusterDetailsValues>,
  ) => {
    clearAlerts();

    // async validation for cluster name - run only on submit
    // TODO(jtomasek): Update this to validate combination of cluster name + dns domain
    try {
      const { data: clusters } = await getClusters();
      const names = clusters.map((c) => c.name).filter((n) => n !== cluster.name);
      if (names.includes(values.name)) {
        return formikActions.setFieldError('name', `Name "${values.name}" is already taken.`);
      }
    } catch (e) {
      captureException(e, 'Failed to perform unique cluster name validation.');
    }

    try {
      const params = _.omit(values, ['useRedHatDnsService']);

      if (pullSecretSet) {
        delete params.pullSecret;
      }

      const { data } = await patchCluster(cluster.id, params);
      dispatch(updateCluster(data));

      canNextClusterDetails({ cluster: data }) && setCurrentStepId('baremetal-discovery');
    } catch (e) {
      handleApiError<ClusterUpdateParams>(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
      );
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, isValid, values, setFieldValue }) => {
        const { name: clusterName, baseDnsDomain, useRedHatDnsService } = values;

        const baseDnsHelperText = (
          <>
            All DNS records must be subdomains of this base and include the cluster name. This
            cannot be changed after cluster installation. The full cluster address will be: <br />
            <strong>
              {clusterName || '[Cluster Name]'}.{baseDnsDomain || '[example.com]'}
            </strong>
          </>
        );

        const toggleRedHatDnsService = (checked: boolean) =>
          setFieldValue('baseDnsDomain', checked ? managedDomains.map((d) => d.domain)[0] : '');

        const form = (
          <>
            <Grid hasGutter>
              <GridItem>
                <TextContent>
                  <Text component="h2">Cluster Details</Text>
                </TextContent>
              </GridItem>
              <GridItem span={12} lg={10} xl={9} xl2={7}>
                <Form id="wizard-cluster-details__form">
                  <InputField ref={nameInputRef} label="Cluster Name" name="name" isRequired />
                  <SelectField
                    label="OpenShift Version"
                    name="openshiftVersion"
                    options={[{ label: openshiftVersion, value: openshiftVersion }]}
                    // getHelperText={getOpenshiftVersionHelperText}
                    isDisabled
                    isRequired
                  />
                  {(pullSecret || !pullSecretSet) && <PullSecret pullSecret={pullSecret} />}
                  {!!managedDomains.length && (
                    <CheckboxField
                      name="useRedHatDnsService"
                      label="Use a temporary 60-day domain"
                      helperText="A base domain will be provided for temporary, non-production clusters."
                      onChange={toggleRedHatDnsService}
                    />
                  )}
                  {values.useRedHatDnsService ? (
                    <SelectField
                      label="Base Domain"
                      name="baseDnsDomain"
                      helperText={baseDnsHelperText}
                      options={managedDomains.map((d) => ({
                        label: `${d.domain} (${d.provider})`,
                        value: d.domain,
                      }))}
                      isRequired
                    />
                  ) : (
                    <InputField
                      label="Base Domain"
                      name="baseDnsDomain"
                      helperText={baseDnsHelperText}
                      placeholder="example.com"
                      isDisabled={useRedHatDnsService}
                      isRequired
                    />
                  )}
                </Form>
              </GridItem>
            </Grid>
          </>
        );
        const footer = (
          <Stack hasGutter>
            {!!alerts.length && (
              <StackItem>
                <Alerts />
              </StackItem>
            )}
            <StackItem>
              <ClusterToolbar>
                {/* TODO(mlibra): unify toolbar with other steps */}
                <ToolbarButton
                  name="save"
                  variant={ButtonVariant.primary}
                  isDisabled={isSubmitting || !isValid}
                  onClick={submitForm}
                >
                  Next
                </ToolbarButton>

                <ToolbarButton
                  variant={ButtonVariant.link}
                  onClick={() => history.push(`${routeBasePath}/clusters`)}
                >
                  Cancel
                </ToolbarButton>
                {isSubmitting && (
                  <ToolbarText>
                    <Spinner size="md" /> Submitting...
                  </ToolbarText>
                )}
              </ClusterToolbar>
            </StackItem>
          </Stack>
        );
        return <ClusterWizardStep footer={footer}>{form}</ClusterWizardStep>;
      }}
    </Formik>
  );
};

type ClusterDetailsProps = {
  cluster: Cluster;
};

const ClusterDetails: React.FC<ClusterDetailsProps> = ({ cluster }) => {
  const [managedDomains, setManagedDomains] = React.useState<ManagedDomain[]>();
  const { addAlert } = React.useContext(AlertsContext);

  React.useEffect(() => {
    const fetchManagedDomains = async () => {
      try {
        const { data } = await getManagedDomains();
        setManagedDomains(data);
      } catch (e) {
        setManagedDomains([]);
        handleApiError(e, () =>
          addAlert({ title: 'Failed to retrieve managed domains', message: getErrorMessage(e) }),
        );
      }
    };
    fetchManagedDomains();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pullSecret = usePullSecretFetch();

  if (pullSecret === undefined || !managedDomains) {
    return (
      <ClusterWizardStep>
        <LoadingState />
      </ClusterWizardStep>
    );
  }
  return (
    <ClusterDetailsForm cluster={cluster} pullSecret={pullSecret} managedDomains={managedDomains} />
  );
};

export default ClusterDetails;
