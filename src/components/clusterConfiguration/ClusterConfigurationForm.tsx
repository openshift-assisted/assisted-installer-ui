import React from 'react';
import { Formik, FormikProps, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import {
  Form,
  PageSectionVariants,
  TextContent,
  Text,
  ButtonVariant,
  Grid,
  GridItem,
  TextVariants,
  Spinner,
  Button,
} from '@patternfly/react-core';
import { WarningTriangleIcon, CheckCircleIcon } from '@patternfly/react-icons';
import { global_success_color_100 as successColor } from '@patternfly/react-tokens';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { useDispatch } from 'react-redux';

import ClusterToolbar from '../clusters/ClusterToolbar';
import PageSection from '../ui/PageSection';
import { InputField } from '../ui/formik';
import { ToolbarButton, ToolbarText, ToolbarSecondaryGroup } from '../ui/Toolbar';
import GridGap from '../ui/GridGap';
import { EventsModalButton } from '../ui/eventsModal';
import { Cluster, ClusterUpdateParams, ManagedDomain } from '../../api/types';
import { patchCluster, postInstallCluster, getClusters } from '../../api/clusters';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { isSingleClusterMode, routeBasePath } from '../../config/constants';
import AlertsSection from '../ui/AlertsSection';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import BaremetalInventory from './BaremetalInventory';
import {
  nameValidationSchema,
  sshPublicKeyValidationSchema,
  ipBlockValidationSchema,
  dnsNameValidationSchema,
  hostPrefixValidationSchema,
  vipValidationSchema,
} from '../ui/formik/validationSchemas';
import ClusterBreadcrumbs from '../clusters/ClusterBreadcrumbs';
import { HostSubnets, ClusterConfigurationValues } from '../../types/clusters';
import NetworkConfiguration from './NetworkConfiguration';
import ClusterValidationSection from './ClusterValidationSection';
import { getInitialValues, getHostSubnets } from './utils';
import { AlertsContext } from '../AlertsContextProvider';
import ClusterSshKeyField from './ClusterSshKeyField';
import { captureException } from '../../sentry';

const validationSchema = (initialValues: ClusterConfigurationValues, hostSubnets: HostSubnets) =>
  Yup.lazy<ClusterConfigurationValues>((values) =>
    Yup.object<ClusterConfigurationValues>().shape({
      name: nameValidationSchema,
      baseDnsDomain: dnsNameValidationSchema(initialValues.baseDnsDomain),
      clusterNetworkHostPrefix: hostPrefixValidationSchema(values),
      clusterNetworkCidr: ipBlockValidationSchema,
      serviceNetworkCidr: ipBlockValidationSchema,
      apiVip: vipValidationSchema(hostSubnets, values, initialValues.apiVip),
      ingressVip: vipValidationSchema(hostSubnets, values, initialValues.ingressVip),
      sshPublicKey: sshPublicKeyValidationSchema,
    }),
  );

type ClusterConfigurationFormProps = {
  cluster: Cluster;
  managedDomains: ManagedDomain[];
};

const ClusterConfigurationForm: React.FC<ClusterConfigurationFormProps> = ({
  cluster,
  managedDomains,
}) => {
  const [isValidationSectionOpen, setIsValidationSectionOpen] = React.useState(false);
  const [isStartingInstallation, setIsStartingInstallation] = React.useState(false);
  const { addAlert, clearAlerts } = React.useContext(AlertsContext);
  const dispatch = useDispatch();
  const hostSubnets = React.useMemo(() => getHostSubnets(cluster), [cluster]);
  const initialValues = React.useMemo(() => getInitialValues(cluster, managedDomains), [
    cluster,
    managedDomains,
  ]);
  const memoizedValidationSchema = React.useMemo(
    () => validationSchema(initialValues, hostSubnets),
    [hostSubnets, initialValues],
  );

  const handleSubmit = async (
    values: ClusterConfigurationValues,
    formikActions: FormikHelpers<ClusterConfigurationValues>,
  ) => {
    clearAlerts();

    // async validation for cluster name - run only on submit
    try {
      const { data: clusters } = await getClusters();
      const names = clusters.map((c) => c.name).filter((n) => n !== cluster.name);
      if (names.includes(values.name)) {
        return formikActions.setFieldError('name', `Name "${values.name}" is already taken.`);
      }
    } catch (e) {
      captureException(e, 'Failed to perform unique cluster name validation.');
    }

    // update the cluster configuration
    try {
      const params = _.omit(values, ['hostSubnet', 'useRedHatDnsService', 'shareDiscoverySshKey']);

      if (values.shareDiscoverySshKey) {
        params.sshPublicKey = cluster.imageInfo.sshPublicKey;
      }

      if (values.vipDhcpAllocation) {
        delete params.apiVip;
        delete params.ingressVip;
        const cidr = hostSubnets
          .find((hn) => hn.humanized === values.hostSubnet)
          ?.subnet.toString();
        params.machineNetworkCidr = cidr;
      }

      const { data } = await patchCluster(cluster.id, params);
      formikActions.resetForm({
        values: getInitialValues(data, managedDomains),
      });
      dispatch(updateCluster(data));
    } catch (e) {
      handleApiError<ClusterUpdateParams>(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
      );
    }
  };

  const handleClusterInstall = async () => {
    setIsStartingInstallation(true);
    try {
      const { data } = await postInstallCluster(cluster.id);
      dispatch(updateCluster(data));
    } catch (e) {
      handleApiError(e, () =>
        addAlert({
          title: 'Failed to start cluster installation',
          message: getErrorMessage(e),
        }),
      );
    }
    setIsStartingInstallation(false);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={memoizedValidationSchema}
      onSubmit={handleSubmit}
      initialTouched={_.mapValues(initialValues, () => true)}
      validateOnMount
    >
      {({
        isSubmitting,
        isValid,
        dirty,
        submitForm,
        resetForm,
        setFieldValue,
        values,
        errors,
      }: FormikProps<ClusterConfigurationValues>) => {
        const onClusterSshKeyToggle = (isChecked: boolean) =>
          setFieldValue('shareDiscoverySshKey', isChecked);
        const onClusterSshKeyVisibilityChanged = () => {
          onClusterSshKeyToggle(
            !!cluster.imageInfo.sshPublicKey &&
              (cluster.sshPublicKey === cluster.imageInfo.sshPublicKey || !cluster.sshPublicKey),
          );
        };
        const onSshKeyBlur = () => {
          if (values.sshPublicKey) {
            setFieldValue('sshPublicKey', values.sshPublicKey.trim());
          }
        };

        return (
          <>
            <ClusterBreadcrumbs clusterName={cluster.name} />
            <PageSection variant={PageSectionVariants.light} isMain>
              <Form>
                <Grid hasGutter>
                  <GridItem span={12} lg={10} xl={6}>
                    {/* TODO(jtomasek): remove this if we're not putting full width content here (e.g. hosts table)*/}
                    <GridGap>
                      <TextContent>
                        <Text component="h1">
                          Install OpenShift on Bare Metal with the Assisted Installer
                        </Text>
                      </TextContent>
                      <InputField label="Cluster Name" name="name" isRequired />
                    </GridGap>
                  </GridItem>
                  <GridItem span={12}>
                    <GridGap>
                      <BaremetalInventory cluster={cluster} />
                    </GridGap>
                  </GridItem>
                  <GridItem span={12} lg={10} xl={6}>
                    <GridGap>
                      <NetworkConfiguration
                        cluster={cluster}
                        hostSubnets={hostSubnets}
                        managedDomains={managedDomains}
                      />
                      <TextContent>
                        <Text component="h2">Security</Text>
                      </TextContent>
                      <ClusterSshKeyField
                        isSwitchHidden={!cluster.imageInfo.sshPublicKey}
                        name="shareDiscoverySshKey"
                        onToggle={onClusterSshKeyToggle}
                        onClusterSshKeyVisibilityChanged={onClusterSshKeyVisibilityChanged}
                        onSshKeyBlur={onSshKeyBlur}
                      />
                    </GridGap>
                  </GridItem>
                </Grid>
              </Form>
            </PageSection>
            <AlertsSection />
            <ClusterToolbar
              validationSection={
                isValidationSectionOpen ? (
                  <ClusterValidationSection
                    cluster={cluster}
                    dirty={dirty}
                    formErrors={errors}
                    onClose={() => setIsValidationSectionOpen(false)}
                  />
                ) : null
              }
            >
              <ToolbarButton
                variant={ButtonVariant.primary}
                name="install"
                onClick={handleClusterInstall}
                isDisabled={
                  isStartingInstallation || !isValid || dirty || cluster.status !== 'ready'
                }
              >
                Install Cluster
              </ToolbarButton>
              <ToolbarButton
                type="submit"
                name="save"
                variant={ButtonVariant.secondary}
                isDisabled={isSubmitting || !isValid || !dirty}
                onClick={submitForm}
              >
                Validate & Save Changes
              </ToolbarButton>
              <ToolbarButton
                variant={ButtonVariant.secondary}
                isDisabled={isSubmitting || !dirty}
                onClick={() => resetForm()}
              >
                Discard Changes
              </ToolbarButton>
              <ToolbarButton
                variant={ButtonVariant.link}
                component={(props) => <Link to={`${routeBasePath}/clusters`} {...props} />}
                isHidden={isSingleClusterMode()}
              >
                Back to all clusters
              </ToolbarButton>
              {isSubmitting && (
                <ToolbarText component={TextVariants.small}>
                  <Spinner size="sm" /> Saving changes...
                </ToolbarText>
              )}
              {isStartingInstallation ? (
                <ToolbarText component={TextVariants.small}>
                  <Spinner size="sm" /> Starting installation...
                </ToolbarText>
              ) : (
                <ToolbarText component={TextVariants.small}>
                  {!Object.keys(errors).length && !dirty && cluster.status === 'ready' ? (
                    <>
                      <CheckCircleIcon color={successColor.value} /> The cluster is ready to be
                      installed.
                    </>
                  ) : (
                    <>
                      <Button
                        variant={ButtonVariant.link}
                        onClick={() => setIsValidationSectionOpen(!isValidationSectionOpen)}
                        isInline
                      >
                        <WarningTriangleIcon color={warningColor.value} />{' '}
                        <small>The cluster is not ready to be installed yet</small>
                      </Button>
                    </>
                  )}
                </ToolbarText>
              )}
              <ToolbarSecondaryGroup>
                <EventsModalButton
                  id="cluster-events-button"
                  entityKind="cluster"
                  cluster={cluster}
                  title="Cluster Events"
                  variant={ButtonVariant.link}
                  style={{ textAlign: 'right' }}
                >
                  View Cluster Events
                </EventsModalButton>
              </ToolbarSecondaryGroup>
            </ClusterToolbar>
          </>
        );
      }}
    </Formik>
  );
};

export default ClusterConfigurationForm;
