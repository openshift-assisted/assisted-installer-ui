import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik, FormikConfig, useFormikContext } from 'formik';
import mapValues from 'lodash/mapValues';
import { Form, Grid, GridItem, Text, TextContent } from '@patternfly/react-core';
import {
  Cluster,
  ClusterWizardStep,
  ClusterWizardStepHeader,
  getFormikErrorFields,
  getHostSubnets,
  NetworkConfigurationValues,
  HostSubnets,
  InfraEnv,
  isSNO,
  LoadingState,
  useAlerts,
  useFormikAutoSave,
  V2ClusterUpdateParams,
  IPV4_STACK,
} from '../../../../common';
import { useDefaultConfiguration } from '../ClusterDefaultConfigurationContext';
import { useClusterWizardContext } from '../../clusterWizard/ClusterWizardContext';
import ClusterWizardFooter from '../../clusterWizard/ClusterWizardFooter';
import { canNextNetwork } from '../../clusterWizard/wizardTransition';
import ClusterWizardNavigation from '../../clusterWizard/ClusterWizardNavigation';
import ClusterWizardHeaderExtraActions from '../ClusterWizardHeaderExtraActions';
import NetworkConfigurationTable from './NetworkConfigurationTable';
import useInfraEnv from '../../../hooks/useInfraEnv';
import {
  getNetworkConfigurationValidationSchema,
  getNetworkInitialValues,
} from './networkConfigurationValidation';
import { captureException } from '../../../sentry';
import { ClustersAPI } from '../../../services/apis';
import { updateClusterBase } from '../../../reducers/clusters';
import { getApiErrorMessage, handleApiError } from '../../../api';
import NetworkConfigurationFormFields from './NetworkConfigurationFormFields';

const NetworkConfigurationForm: React.FC<{
  cluster: Cluster;
  hostSubnets: HostSubnets;
  defaultNetworkSettings: Pick<NetworkConfigurationValues, 'serviceNetworks' | 'clusterNetworks'>;
  infraEnv?: InfraEnv;
}> = ({ cluster, hostSubnets, defaultNetworkSettings, infraEnv }) => {
  const { alerts } = useAlerts();
  const clusterWizardContext = useClusterWizardContext();
  const { errors, touched, isSubmitting, isValid } = useFormikContext<NetworkConfigurationValues>();
  const isAutoSaveRunning = useFormikAutoSave();
  const errorFields = getFormikErrorFields(errors, touched);

  const footer = (
    <ClusterWizardFooter
      cluster={cluster}
      errorFields={errorFields}
      isSubmitting={isSubmitting}
      isNextDisabled={
        isSubmitting ||
        isAutoSaveRunning ||
        !canNextNetwork({ cluster }) ||
        !!alerts.length ||
        !isValid
      }
      onNext={() => clusterWizardContext.moveNext()}
      onBack={() => clusterWizardContext.moveBack()}
    />
  );
  return (
    <ClusterWizardStep navigation={<ClusterWizardNavigation cluster={cluster} />} footer={footer}>
      <Form>
        <Grid hasGutter>
          <GridItem>
            <ClusterWizardStepHeader
              extraItems={<ClusterWizardHeaderExtraActions cluster={cluster} />}
            >
              Networking
            </ClusterWizardStepHeader>
          </GridItem>
          <GridItem span={12} lg={10} xl={9} xl2={7}>
            <NetworkConfigurationFormFields
              cluster={cluster}
              hostSubnets={hostSubnets}
              defaultNetworkSettings={defaultNetworkSettings}
              infraEnv={infraEnv}
            />
          </GridItem>
          <GridItem>
            <TextContent>
              <Text component="h2">Host inventory</Text>
            </TextContent>
            <NetworkConfigurationTable cluster={cluster} />
          </GridItem>
        </Grid>
      </Form>
    </ClusterWizardStep>
  );
};

const NetworkConfigurationPage: React.FC<{
  cluster: Cluster;
}> = ({ cluster }) => {
  const { infraEnv, error: infraEnvError, isLoading } = useInfraEnv(cluster.id);
  const defaultNetworkSettings = useDefaultConfiguration([
    'clusterNetworkCidr',
    'serviceNetworkCidr',
    'clusterNetworkHostPrefix',
  ]);

  const defaultNetworkValues: Pick<
    NetworkConfigurationValues,
    'serviceNetworks' | 'clusterNetworks'
  > = {
    serviceNetworks: [
      {
        cidr: defaultNetworkSettings.serviceNetworkCidr,
        clusterId: cluster.id,
      },
    ],
    clusterNetworks: [
      {
        cidr: defaultNetworkSettings.clusterNetworkCidr,
        hostPrefix: defaultNetworkSettings.clusterNetworkHostPrefix,
        clusterId: cluster.id,
      },
    ],
  };

  const { addAlert, clearAlerts, alerts } = useAlerts();
  const dispatch = useDispatch();
  const hostSubnets = React.useMemo(() => getHostSubnets(cluster), [cluster]);
  const initialValues = React.useMemo(
    () => getNetworkInitialValues(cluster, defaultNetworkValues),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // just once, Formik does not reinitialize
  );

  const initialTouched = React.useMemo(() => mapValues(initialValues, () => true), [initialValues]);

  const memoizedValidationSchema = React.useMemo(
    () => getNetworkConfigurationValidationSchema(initialValues, hostSubnets),
    [hostSubnets, initialValues],
  );

  React.useEffect(() => {
    if (infraEnvError) {
      const title = `Failed to retrieve infra env (clusterId: ${cluster.id})`;
      //TODO(brotman) add handling of existing errors to alerts context
      if (alerts.find((alert) => alert.title === title)) {
        return;
      }
      captureException(infraEnvError, title);
      addAlert({
        title,
        message: infraEnvError.message,
      });
    }
    //shouldn't respond to cluster polling. shouldn't respond to alerts changes so remove alert wouldn't trigger adding it back
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infraEnvError]);

  const handleSubmit: FormikConfig<NetworkConfigurationValues>['onSubmit'] = async (values) => {
    clearAlerts();
    // update the cluster configuration
    try {
      const isMultiNodeCluster = !isSNO(cluster);
      const isUserManagedNetworking = values.managedNetworkingType === 'userManaged';

      const params: V2ClusterUpdateParams = {
        apiVip: values.apiVip,
        ingressVip: values.ingressVip,
        sshPublicKey: values.sshPublicKey,
        vipDhcpAllocation: values.vipDhcpAllocation,
        networkType: values.networkType,
        machineNetworks: values.machineNetworks,
        clusterNetworks: values.clusterNetworks,
        serviceNetworks: values.serviceNetworks,
        userManagedNetworking: isUserManagedNetworking,
      };

      if (params.userManagedNetworking) {
        delete params.apiVip;
        delete params.ingressVip;
        if (isMultiNodeCluster) {
          delete params.machineNetworks;
        }
      } else {
        // cluster-managed can't be chosen in SNO, so this must be a multi-node cluster
        if (values.vipDhcpAllocation) {
          delete params.apiVip;
          delete params.ingressVip;
        } else if (values.stackType === IPV4_STACK) {
          delete params.machineNetworks;
        }
      }

      const { data } = await ClustersAPI.update(cluster.id, params);
      dispatch(updateClusterBase(data));
    } catch (e) {
      handleApiError(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getApiErrorMessage(e) }),
      );
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={memoizedValidationSchema}
      onSubmit={handleSubmit}
      initialTouched={initialTouched}
      validateOnMount
    >
      <NetworkConfigurationForm
        cluster={cluster}
        hostSubnets={hostSubnets}
        defaultNetworkSettings={defaultNetworkValues}
        infraEnv={infraEnv}
      />
    </Formik>
  );
};

export default NetworkConfigurationPage;
