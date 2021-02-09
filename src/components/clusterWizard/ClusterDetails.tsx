import React from 'react';
import * as Yup from 'yup';
import _ from 'lodash';
import { Formik, FormikHelpers } from 'formik';
import { Cluster, ClusterCreateParams, ClusterUpdateParams, ManagedDomain } from '../../api/types';
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
import { getClusters, patchCluster, postCluster } from '../../api/clusters';
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
import { useOpenshiftVersions } from '../fetching/openshiftVersions';
import { OpenshiftVersionOptionType } from '../../types/versions';
import SingleNodeCheckbox from '../ui/formik/SingleNodeCheckbox';
import OpenShiftVersionSelect from '../clusterConfiguration/OpenShiftVersionSelect';

type ClusterDetailsFormProps = {
  cluster?: Cluster;
  pullSecret: string;
  managedDomains: ManagedDomain[];
  versions: OpenshiftVersionOptionType[];
};

type ClusterDetailsValues = {
  name: string;
  highAvailabilityMode: 'Full' | 'None';
  openshiftVersion: string;
  pullSecret: string;
  baseDnsDomain: string;
  useRedHatDnsService: boolean;
};

const getDefaultOpenShiftVersion = (versions: OpenshiftVersionOptionType[]) =>
  // TODO(jtomasek): one of the available versions should be flagged as a default
  // from the server so we don't have to hardcode here
  // https://issues.redhat.com/browse/MGMT-4363
  versions.find((v) => v.value === '4.7')?.value || versions[0]?.value || '';

const getInitialValues = (props: ClusterDetailsFormProps): ClusterDetailsValues => {
  const { cluster, pullSecret, managedDomains, versions } = props;
  const {
    name = '',
    highAvailabilityMode = 'Full',
    baseDnsDomain = '',
    openshiftVersion = getDefaultOpenShiftVersion(versions),
  } = cluster || {};
  return {
    name,
    highAvailabilityMode,
    openshiftVersion,
    pullSecret,
    baseDnsDomain,
    useRedHatDnsService:
      !!baseDnsDomain && managedDomains.map((d) => d.domain).includes(baseDnsDomain),
  };
};

const getValidationSchema = (cluster?: Cluster) => {
  if (cluster?.pullSecretSet) {
    return Yup.object({
      name: nameValidationSchema,
      baseDnsDomain: dnsNameValidationSchema.required('Base Domain is required.'),
    });
  }
  return Yup.object({
    name: nameValidationSchema,
    pullSecret: validJSONSchema.required('Pull secret must be provided.'),
    baseDnsDomain: dnsNameValidationSchema.required('Base Domain is required.'),
  });
};

// For performance reasons, this is validated on submit only
const validateClusterName = async (newFullName: string, existingClusterFullName?: string) => {
  try {
    const { data: clusters } = await getClusters();
    const names = clusters
      .map((c) => `${c.name}.${c.baseDnsDomain}`)
      .filter((n) => n !== existingClusterFullName);
    if (names.includes(newFullName)) {
      return `Name "${newFullName}" is already taken.`;
    }
  } catch (e) {
    captureException(e, 'Failed to perform unique cluster name validation.');
  }
};

const ClusterDetailsForm: React.FC<ClusterDetailsFormProps> = (props) => {
  const { cluster, pullSecret, managedDomains, versions } = props;
  const { alerts, addAlert, clearAlerts } = React.useContext(AlertsContext);
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const history = useHistory();
  const dispatch = useDispatch();
  const nameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // TODO(jtomasek): Update this to validate combination of cluster name + dns domain
  const handleClusterUpdate = async (clusterId: Cluster['id'], values: ClusterDetailsValues) => {
    const params: ClusterUpdateParams = _.omit(values, [
      'highAvailabilityMode',
      'pullSecret',
      'openshiftVersion',
      'useRedHatDnsService',
    ]);

    try {
      const { data } = await patchCluster(clusterId, params);
      dispatch(updateCluster(data));

      canNextClusterDetails({ cluster: data }) && setCurrentStepId('baremetal-discovery');
    } catch (e) {
      handleApiError<ClusterUpdateParams>(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
      );
    }
  };

  const handleClusterCreate = async (values: ClusterDetailsValues) => {
    const params: ClusterCreateParams = _.omit(values, ['useRedHatDnsService']);

    try {
      const { data } = await postCluster(params);
      history.push(`${routeBasePath}/clusters/${data.id}`);
    } catch (e) {
      handleApiError<ClusterCreateParams>(e, () =>
        addAlert({ title: 'Failed to create new cluster', message: getErrorMessage(e) }),
      );
    }
  };

  const handleSubmit = async (
    values: ClusterDetailsValues,
    formikActions: FormikHelpers<ClusterDetailsValues>,
  ) => {
    clearAlerts();

    const newClusterFullName = `${values.name}.${values.baseDnsDomain}`;
    if (cluster) {
      const clusterNameError = await validateClusterName(
        newClusterFullName,
        `${cluster.name}.${cluster.baseDnsDomain}`,
      );
      if (clusterNameError) {
        return formikActions.setFieldError('name', clusterNameError);
      }
      await handleClusterUpdate(cluster.id, values);
    } else {
      const clusterNameError = await validateClusterName(newClusterFullName);
      if (clusterNameError) {
        return formikActions.setFieldError('name', clusterNameError);
      }
      await handleClusterCreate(values);
    }
  };

  const initialValues = getInitialValues(props);
  const validationSchema = getValidationSchema(cluster);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, isValid, dirty, values, setFieldValue }) => {
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
                  <SingleNodeCheckbox
                    name="highAvailabilityMode"
                    versions={versions}
                    isDisabled={!!cluster}
                  />
                  <OpenShiftVersionSelect versions={versions} />
                  {!cluster?.pullSecretSet && <PullSecret pullSecret={pullSecret} />}
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
                  isDisabled={
                    cluster ? isSubmitting || !isValid : isSubmitting || !isValid || !dirty
                  }
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
        return (
          <ClusterWizardStep cluster={cluster} footer={footer}>
            {form}
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

type ClusterDetailsProps = {
  cluster?: Cluster;
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

  const { error: errorOCPVersions, loading: loadingOCPVersions, versions } = useOpenshiftVersions();

  React.useEffect(() => errorOCPVersions && addAlert(errorOCPVersions), [
    errorOCPVersions,
    addAlert,
  ]);

  if (pullSecret === undefined || !managedDomains || loadingOCPVersions) {
    return (
      <ClusterWizardStep cluster={cluster}>
        <LoadingState />
      </ClusterWizardStep>
    );
  }
  return (
    <ClusterDetailsForm
      cluster={cluster}
      pullSecret={pullSecret}
      managedDomains={managedDomains}
      versions={versions}
    />
  );
};

export default ClusterDetails;
