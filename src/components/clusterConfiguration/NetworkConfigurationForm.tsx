import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik, FormikConfig, FormikProps } from 'formik';
import * as Yup from 'yup';
import _ from 'lodash';
import {
  Cluster,
  ClusterUpdateParams,
  getErrorMessage,
  handleApiError,
  patchCluster,
} from '../../api';
import { Form, Grid, GridItem, Text, TextContent } from '@patternfly/react-core';

import { AlertsContext } from '../AlertsContextProvider';
import {
  sshPublicKeyValidationSchema,
  ipBlockValidationSchema,
  hostPrefixValidationSchema,
  vipValidationSchema,
} from '../ui/formik/validationSchemas';
import ClusterWizardStep from '../clusterWizard/ClusterWizardStep';
import { HostSubnets, NetworkConfigurationValues } from '../../types/clusters';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import ClusterWizardToolbar from '../clusterWizard/ClusterWizardToolbar';
import { canNextNetwork } from '../clusterWizard/wizardTransition';
import ClusterWizardContext from '../clusterWizard/ClusterWizardContext';
import NetworkConfiguration from './NetworkConfiguration';
import ClusterSshKeyFields from './ClusterSshKeyFields';
import { getHostSubnets, getNetworkInitialValues } from './utils';
import { useDefaultConfiguration } from './ClusterDefaultConfigurationContext';
import NetworkingHostsTable from '../hosts/NetworkingHostsTable';
import FormikAutoSave from '../ui/formik/FormikAutoSave';
import { isSingleNodeCluster } from '../clusters/utils';

const validationSchema = (initialValues: NetworkConfigurationValues, hostSubnets: HostSubnets) =>
  Yup.lazy<NetworkConfigurationValues>((values) =>
    Yup.object<NetworkConfigurationValues>().shape({
      clusterNetworkHostPrefix: hostPrefixValidationSchema(values),
      clusterNetworkCidr: ipBlockValidationSchema,
      serviceNetworkCidr: ipBlockValidationSchema,
      apiVip: vipValidationSchema(hostSubnets, values, initialValues.apiVip),
      ingressVip: vipValidationSchema(hostSubnets, values, initialValues.ingressVip),
      sshPublicKey: sshPublicKeyValidationSchema,
    }),
  );

const NetworkConfigurationForm: React.FC<{
  cluster: Cluster;
}> = ({ cluster }) => {
  const defaultNetworkSettings = useDefaultConfiguration([
    'clusterNetworkCidr',
    'serviceNetworkCidr',
    'clusterNetworkHostPrefix',
  ]);
  const { addAlert, clearAlerts } = React.useContext(AlertsContext);
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const dispatch = useDispatch();
  const hostSubnets = React.useMemo(() => getHostSubnets(cluster), [cluster]);
  const initialValues = React.useMemo(
    () => getNetworkInitialValues(cluster, defaultNetworkSettings),
    [cluster, defaultNetworkSettings],
  );

  const memoizedValidationSchema = React.useMemo(
    () => validationSchema(initialValues, hostSubnets),
    [hostSubnets, initialValues],
  );

  const handleSubmit: FormikConfig<NetworkConfigurationValues>['onSubmit'] = async (values) => {
    clearAlerts();

    // update the cluster configuration
    try {
      const isMultiNodeCluster = !isSingleNodeCluster(cluster);
      const isUserManagedNetworking = values.networkingType === 'userManaged';
      const params = _.omit(values, ['hostSubnet', 'useRedHatDnsService', 'networkingType']);
      params.userManagedNetworking = isUserManagedNetworking;
      params.machineNetworkCidr = hostSubnets.find(
        (hn) => hn.humanized === values.hostSubnet,
      )?.subnet;

      if (isUserManagedNetworking) {
        if (isMultiNodeCluster) {
          delete params.machineNetworkCidr;
        }

        delete params.apiVip;
        delete params.ingressVip;
      } else {
        // cluster-managed can't be chosen in SNO, so this must be a multi-node cluster
        if (values.vipDhcpAllocation) {
          delete params.apiVip;
          delete params.ingressVip;
        } else {
          delete params.machineNetworkCidr;
        }
      }

      const { data } = await patchCluster(cluster.id, params);
      dispatch(updateCluster(data));
    } catch (e) {
      handleApiError<ClusterUpdateParams>(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
      );
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={memoizedValidationSchema}
      onSubmit={handleSubmit}
      initialTouched={_.mapValues(initialValues, () => true)}
      validateOnMount
    >
      {({ isSubmitting, dirty, errors }: FormikProps<NetworkConfigurationValues>) => {
        const form = (
          <>
            <Grid hasGutter>
              <GridItem>
                <TextContent>
                  <Text component="h2">Networking</Text>
                </TextContent>
              </GridItem>
              <GridItem span={12} lg={10} xl={9} xl2={7}>
                <Form>
                  <NetworkConfiguration cluster={cluster} hostSubnets={hostSubnets} />
                  <TextContent>
                    <Text component="h2">Security</Text>
                  </TextContent>
                  <ClusterSshKeyFields
                    clusterSshKey={cluster.sshPublicKey}
                    imageSshKey={cluster.imageInfo.sshPublicKey}
                  />
                </Form>
              </GridItem>
              <GridItem>
                <TextContent>
                  <Text component="h2">Host inventory</Text>
                </TextContent>
                <NetworkingHostsTable cluster={cluster} />
              </GridItem>
            </Grid>
            <FormikAutoSave />
          </>
        );

        const footer = (
          <ClusterWizardToolbar
            cluster={cluster}
            formErrors={errors}
            dirty={dirty}
            isSubmitting={isSubmitting}
            isNextDisabled={dirty || !canNextNetwork({ cluster })}
            onNext={() => setCurrentStepId('review')}
            onBack={() => setCurrentStepId('host-discovery')}
          />
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

export default NetworkConfigurationForm;
