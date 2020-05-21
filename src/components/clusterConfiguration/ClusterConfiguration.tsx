import React from 'react';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import {
  Form,
  PageSectionVariants,
  TextContent,
  Text,
  ButtonVariant,
  Grid,
  GridItem,
  Alert,
  AlertVariant,
  AlertActionCloseButton,
  TextInputTypes,
  TextVariants,
  Spinner,
  Breadcrumb,
  BreadcrumbItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { global_danger_color_100 as dangerColor } from '@patternfly/react-tokens';
import { useDispatch, useSelector } from 'react-redux';

import ClusterToolbar from '../clusters/ClusterToolbar';
import PageSection from '../ui/PageSection';
import { ToolbarButton, ToolbarText } from '../ui/Toolbar';
import { InputField, TextAreaField } from '../ui/formik';
import GridGap from '../ui/GridGap';
import { Cluster, ClusterUpdateParams } from '../../api/types';
import { patchCluster, postInstallCluster } from '../../api/clusters';
import { handleApiError } from '../../api/utils';
import { CLUSTER_MANAGER_SITE_LINK } from '../../config/constants';
import AlertsSection from '../ui/AlertsSection';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import BaremetalInventory from './BaremetalInventory';
import {
  nameValidationSchema,
  sshPublicKeyValidationSchema,
  getUniqueNameValidationSchema,
  validJSONSchema,
  ipValidationSchema,
  ipBlockValidationSchema,
  dnsNameValidationSchema,
  hostPrefixValidationSchema,
} from '../ui/formik/validationSchemas';
import { selectClusterNamesButCurrent } from '../../selectors/clusters';

type ClusterConfigurationValues = ClusterUpdateParams & {
  submitType: 'save' | 'install';
};

interface ClusterConfigurationProps {
  cluster: Cluster;
}

const sshPublicKeyHelperText = (
  <>
    SSH public key for debugging OpenShift nodes, value of <em>~/.ssh/id_rsa.pub</em> can be
    copy&amp;pasted here. To generate new pair, use <em>ssh-keygen -o</em>.
  </>
);

const ClusterConfiguration: React.FC<ClusterConfigurationProps> = ({ cluster }) => {
  const dispatch = useDispatch();
  const clusterNames = useSelector(selectClusterNamesButCurrent);

  const initialValues: ClusterConfigurationValues = {
    name: cluster.name || '',
    baseDnsDomain: cluster.baseDnsDomain || '',
    clusterNetworkCidr: cluster.clusterNetworkCidr || '',
    clusterNetworkHostPrefix: cluster.clusterNetworkHostPrefix || 0,
    serviceNetworkCidr: cluster.serviceNetworkCidr || '',
    apiVip: cluster.apiVip || '',
    ingressVip: cluster.ingressVip || '',
    pullSecret: cluster.pullSecret || '',
    sshPublicKey: cluster.sshPublicKey || '',
    submitType: 'save',
  };

  const validationSchema = React.useCallback(
    () =>
      Yup.object().shape({
        name: getUniqueNameValidationSchema(clusterNames).concat(nameValidationSchema),
        baseDnsDomain: dnsNameValidationSchema,
        clusterNetworkHostPrefix: hostPrefixValidationSchema,
        clusterNetworkCIDR: ipBlockValidationSchema,
        serviceNetworkCIDR: ipBlockValidationSchema,
        apiVip: ipValidationSchema,
        ingressVip: ipValidationSchema,
        pullSecret: validJSONSchema,
        sshPublicKey: sshPublicKeyValidationSchema,
      }),
    [clusterNames],
  );

  const handleSubmit = async (
    values: ClusterConfigurationValues,
    formikActions: FormikHelpers<ClusterConfigurationValues>,
  ) => {
    const { submitType, ...params } = values;

    try {
      const { data } = await patchCluster(cluster.id, params);
      dispatch(updateCluster(data));
    } catch (e) {
      handleApiError<ClusterUpdateParams>(e, () =>
        formikActions.setStatus({ error: 'Failed to update the cluster.' }),
      );
    }

    if (submitType === 'install') {
      try {
        const { data } = await postInstallCluster(cluster.id);
        dispatch(updateCluster(data));
      } catch (e) {
        handleApiError(e, () =>
          formikActions.setStatus({ error: 'Failed to install the cluster.' }),
        );
      }
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({
        setStatus,
        isSubmitting,
        isValid,
        submitForm,
        status,
        setFieldValue,
        values,
      }: FormikProps<ClusterConfigurationValues>) => {
        const handleSubmit = (e: React.MouseEvent) => {
          setFieldValue('submitType', (e.target as HTMLButtonElement).name);
          submitForm();
        };

        return (
          <>
            <PageSection variant={PageSectionVariants.light}>
              <Breadcrumb>
                <BreadcrumbItem>
                  <Link to="/clusters">Clusters</Link>
                </BreadcrumbItem>
                <BreadcrumbItem isActive>{cluster.name}</BreadcrumbItem>
              </Breadcrumb>
            </PageSection>
            <PageSection variant={PageSectionVariants.light} isMain>
              <Form>
                <Grid gutter="md">
                  <GridItem span={12} lg={10} xl={6}>
                    {/* TODO(jtomasek): remove this if we're not putting full width content here (e.g. hosts table)*/}
                    <GridGap>
                      <TextContent>
                        <Text component="h1">Configure a bare metal OpenShift cluster</Text>
                      </TextContent>
                      <InputField label="Cluster Name" name="name" isRequired />
                      <InputField
                        label="Base DNS domain"
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
                      <TextContent>
                        <Text component="h2">Networking</Text>
                      </TextContent>
                      <InputField
                        name="clusterNetworkCIDR"
                        label="Cluster Network CIDR"
                        helperText="IP address block from which Pod IPs are allocated This block must not overlap with existing physical networks. These IP addresses are used for the Pod network, and if you need to access the Pods from an external network, configure load balancers and routers to manage the traffic."
                        isRequired
                      />
                      <InputField
                        name="clusterNetworkHostPrefix"
                        label="Cluster Network Host Prefix"
                        type={TextInputTypes.number}
                        helperText="The subnet prefix length to assign to each individual node. For example, if Cluster Network Host Prefix is set to 23, then each node is assigned a /23 subnet out of the given cidr (clusterNetworkCIDR), which allows for 510 (2^(32 - 23) - 2) pod IPs addresses. If you are required to provide access to nodes from an external network, configure load balancers and routers to manage the traffic."
                        isRequired
                      />
                      <InputField
                        name="serviceNetworkCIDR"
                        label="Service Network CIDR"
                        helperText="The IP address pool to use for service IP addresses. You can enter only one IP address pool. If you need to access the services from an external network, configure load balancers and routers to manage the traffic."
                        isRequired
                      />
                      <InputField
                        label="API Virtual IP"
                        name="apiVip"
                        helperText="Virtual IP used to reach the OpenShift cluster API."
                        isRequired
                      />
                      <InputField
                        name="ingressVip"
                        label="Ingress Virtual IP"
                        helperText="Virtual IP used for cluster ingress traffic."
                        isRequired
                      />
                      <TextContent>
                        <Text component="h2">Security</Text>
                      </TextContent>
                      <TextAreaField
                        name="pullSecret"
                        label="Pull Secret"
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
                        isRequired
                      />
                    </GridGap>
                  </GridItem>
                </Grid>
              </Form>
            </PageSection>
            <AlertsSection>
              {status.error && (
                <Alert
                  variant={AlertVariant.danger}
                  title={status.error}
                  action={<AlertActionCloseButton onClose={() => setStatus({ error: null })} />}
                />
              )}
            </AlertsSection>
            <ClusterToolbar>
              <ToolbarButton
                variant={ButtonVariant.primary}
                name="install"
                onClick={handleSubmit}
                isDisabled={isSubmitting || !isValid}
              >
                Install cluster
              </ToolbarButton>
              <ToolbarButton
                type="submit"
                name="save"
                variant={ButtonVariant.secondary}
                isDisabled={isSubmitting || !isValid}
                onClick={handleSubmit}
              >
                Save Draft
              </ToolbarButton>
              <ToolbarButton
                variant={ButtonVariant.link}
                component={(props) => <Link to="/clusters" {...props} />}
              >
                Close
              </ToolbarButton>
              {isSubmitting && (
                <ToolbarText component={TextVariants.small}>
                  <Spinner size="sm" />{' '}
                  {values.submitType === 'save' ? 'Saving...' : 'Starting installation...'}
                </ToolbarText>
              )}
              {!isValid && (
                <ToolbarText component={TextVariants.small}>
                  <ExclamationCircleIcon color={dangerColor.value} /> There are validation errors.
                </ToolbarText>
              )}
            </ClusterToolbar>
          </>
        );
      }}
    </Formik>
  );
};

export default ClusterConfiguration;
