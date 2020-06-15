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
import { ExternalLinkAltIcon, WarningTriangleIcon, CheckCircleIcon } from '@patternfly/react-icons';
import { global_success_color_100 as successColor } from '@patternfly/react-tokens';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { useDispatch } from 'react-redux';

import ClusterToolbar from '../clusters/ClusterToolbar';
import PageSection from '../ui/PageSection';
import { InputField, TextAreaField, TextAreaSecretField } from '../ui/formik';
import { ToolbarButton, ToolbarText, ToolbarSecondaryGroup } from '../ui/Toolbar';
import GridGap from '../ui/GridGap';
import { EventsModalButton } from '../ui/eventsModal';
import { Cluster, ClusterUpdateParams } from '../../api/types';
import { patchCluster, postInstallCluster, getClusters } from '../../api/clusters';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { CLUSTER_MANAGER_SITE_LINK } from '../../config/constants';
import AlertsSection from '../ui/AlertsSection';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import alertsReducer, {
  addAlert,
  AlertProps,
  removeAlert,
} from '../../features/alerts/alertsSlice';
import BaremetalInventory from './BaremetalInventory';
import {
  nameValidationSchema,
  sshPublicKeyValidationSchema,
  validJSONSchema,
  ipBlockValidationSchema,
  dnsNameValidationSchema,
  hostPrefixValidationSchema,
  vipValidationSchema,
} from '../ui/formik/validationSchemas';
import ClusterBreadcrumbs from '../clusters/ClusterBreadcrumbs';
import { HostSubnets, ClusterConfigurationValues } from '../../types/clusters';
import NetworkConfiguration from './NetworkConfiguration';
import ClusterValidationSection from './ClusterValidationSection';
import { validateCluster } from './clusterValidations';
import { getInitialValues, getHostSubnets, findMatchingSubnet } from './utils';

const validationSchema = (hostSubnets: HostSubnets) =>
  Yup.lazy<ClusterConfigurationValues>((values) =>
    Yup.object<ClusterConfigurationValues>().shape({
      name: nameValidationSchema,
      baseDnsDomain: dnsNameValidationSchema,
      clusterNetworkHostPrefix: hostPrefixValidationSchema,
      clusterNetworkCidr: ipBlockValidationSchema,
      serviceNetworkCidr: ipBlockValidationSchema,
      apiVip: vipValidationSchema(hostSubnets, values),
      ingressVip: vipValidationSchema(hostSubnets, values),
      pullSecret: validJSONSchema,
      sshPublicKey: sshPublicKeyValidationSchema,
    }),
  );

const sshPublicKeyHelperText = (
  <>
    SSH public key for debugging OpenShift nodes, value of <em>~/.ssh/id_rsa.pub</em> can be
    copy&amp;pasted here. To generate new pair, use <em>ssh-keygen -o</em>.
  </>
);

type ClusterConfigurationProps = {
  cluster: Cluster;
};

const ClusterConfiguration: React.FC<ClusterConfigurationProps> = ({ cluster }) => {
  const [isValidationSectionOpen, setIsValidationSectionOpen] = React.useState(false);
  const [isStartingInstallation, setIsStartingInstallation] = React.useState(false);
  const dispatch = useDispatch();
  const [alerts, dispatchAlertsAction] = React.useReducer(alertsReducer, []);
  const hostSubnets = getHostSubnets(cluster);

  const handleSubmit = async (
    values: ClusterConfigurationValues,
    formikActions: FormikHelpers<ClusterConfigurationValues>,
  ) => {
    // async validation for cluster name - run only on submit
    try {
      const { data: clusters } = await getClusters();
      const names = clusters.map((c) => c.name).filter((n) => n !== cluster.name);
      if (names.includes(values.name)) {
        return formikActions.setFieldError('name', `Name "${values.name}" is already taken.`);
      }
    } catch (e) {
      console.error('Failed to perform unique cluster name validation.', e);
    }

    // update the cluster configuration
    try {
      let params = _.omit(values, ['hostSubnet', 'isPullSecretEdit']);
      if (!values.isPullSecretEdit) {
        params = _.omit(params, ['pullSecret']);
      }
      const { data } = await patchCluster(cluster.id, params);
      formikActions.resetForm({ values: getInitialValues(data) });
      dispatch(updateCluster(data));
    } catch (e) {
      handleApiError<ClusterUpdateParams>(e, () =>
        dispatchAlertsAction(
          addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
        ),
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
        dispatchAlertsAction(
          addAlert({
            title: 'Failed to start cluster installation',
            message: getErrorMessage(e),
          }),
        ),
      );
    }
    setIsStartingInstallation(false);
  };

  const clusterErrors = React.useMemo(() => validateCluster(cluster), [cluster]);
  const initialValues = getInitialValues(cluster);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema(hostSubnets)}
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
        if (hostSubnets.length && !hostSubnets.find((hn) => hn.humanized === values.hostSubnet)) {
          setFieldValue(
            'hostSubnet',
            findMatchingSubnet(cluster.ingressVip, cluster.apiVip, hostSubnets),
          );
        }

        const onPullSecretToggle = (isHidden: boolean) => {
          if (isHidden) {
            setFieldValue('isPullSecretEdit', false, false);
          } else {
            setFieldValue('isPullSecretEdit', true, false);
            setFieldValue('pullSecret', '', false);
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
                        <Text component="h1">Configure a bare metal OpenShift cluster</Text>
                      </TextContent>
                      <InputField label="Cluster Name" name="name" isRequired />
                      <InputField
                        label="Base DNS Domain"
                        name="baseDnsDomain"
                        helperText="The base domain of the cluster. All DNS records must be sub-domains of this base and include the cluster name."
                        isRequired
                      />
                    </GridGap>
                  </GridItem>
                  <GridItem span={12}>
                    <BaremetalInventory cluster={cluster} />
                  </GridItem>
                  <GridItem span={12} lg={10} xl={6}>
                    <GridGap>
                      <NetworkConfiguration hostSubnets={hostSubnets} />
                      <TextContent>
                        <Text component="h2">Security</Text>
                      </TextContent>
                      <TextAreaSecretField
                        name="pullSecret"
                        label="Pull Secret"
                        isSet={cluster.pullSecretSet}
                        isEdit={values.isPullSecretEdit}
                        onToggle={onPullSecretToggle}
                        helperTextHidden="The pull secret is already set and its value will not be shown for security reasons."
                        helperText={
                          <>
                            The pull secret obtained from the Pull Secret page on the{' '}
                            {
                              <a
                                href={CLUSTER_MANAGER_SITE_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Red Hat OpenShift Cluster Manager site <ExternalLinkAltIcon />
                              </a>
                            }
                            .
                          </>
                        }
                        isRequired
                      />
                      <TextAreaField
                        name="sshPublicKey"
                        label="SSH Public Key"
                        helperText={sshPublicKeyHelperText}
                      />
                    </GridGap>
                  </GridItem>
                </Grid>
              </Form>
            </PageSection>
            <AlertsSection
              alerts={alerts}
              onClose={(alert: AlertProps) => dispatchAlertsAction(removeAlert(alert.key))}
            />
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
                isDisabled={isStartingInstallation || !isValid || dirty || !!clusterErrors.length}
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
                component={(props) => <Link to="/clusters" {...props} />}
              >
                Close
              </ToolbarButton>
              {isSubmitting && (
                <ToolbarText component={TextVariants.small}>
                  <Spinner size="sm" /> Saving changes...
                </ToolbarText>
              )}
              {isStartingInstallation && (
                <ToolbarText component={TextVariants.small}>
                  <Spinner size="sm" /> Starting installation...
                </ToolbarText>
              )}
              <ToolbarText component={TextVariants.small}>
                {!clusterErrors.length &&
                !Object.keys(errors).length &&
                !dirty &&
                cluster.status === 'ready' ? (
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
              <ToolbarSecondaryGroup>
                <EventsModalButton
                  entityKind="cluster"
                  entityId={cluster.id}
                  title="Cluster Events"
                  variant={ButtonVariant.link}
                  style={{ textAlign: 'right' }}
                >
                  View Cluster Events History
                </EventsModalButton>
              </ToolbarSecondaryGroup>
            </ClusterToolbar>
          </>
        );
      }}
    </Formik>
  );
};

export default ClusterConfiguration;
