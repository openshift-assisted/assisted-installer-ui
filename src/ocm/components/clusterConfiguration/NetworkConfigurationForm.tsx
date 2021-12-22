import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik, FormikConfig, FormikProps } from 'formik';
import _ from 'lodash';
import { Grid, GridItem, Text, TextContent } from '@patternfly/react-core';

import {
  Cluster,
  FormikAutoSave,
  getFormikErrorFields,
  useAlerts,
  ClusterWizardStep,
  ClusterWizardStepHeader,
  NetworkConfigurationFormFields,
  getNetworkConfigurationValidationSchema,
  getNetworkInitialValues,
  getHostSubnets,
  isSingleNodeCluster,
  LoadingState,
} from '../../../common';
import { HostSubnet, NetworkConfigurationValues } from '../../../common/types/clusters';
import { updateCluster } from '../../reducers/clusters/currentClusterSlice';
import { canNextNetwork } from '../clusterWizard/wizardTransition';
import ClusterWizardContext from '../clusterWizard/ClusterWizardContext';
import ClusterWizardFooter from '../clusterWizard/ClusterWizardFooter';
import ClusterWizardNavigation from '../clusterWizard/ClusterWizardNavigation';
import { getErrorMessage, handleApiError } from '../../api';
import ClusterWizardHeaderExtraActions from './ClusterWizardHeaderExtraActions';
import { useDefaultConfiguration } from './ClusterDefaultConfigurationContext';
import NetworkConfigurationTable from './NetworkConfigurationTable';
import { ClustersAPI } from '../../services/apis';
import useInfraEnv from '../../hooks/useInfraEnv';
import { captureException } from '../../sentry';

const NetworkConfigurationForm: React.FC<{
  cluster: Cluster;
}> = ({ cluster }) => {
  const { infraEnv, error: infraEnvError, isLoading } = useInfraEnv(cluster.id);
  const defaultNetworkSettings = useDefaultConfiguration([
    'clusterNetworkCidr',
    'serviceNetworkCidr',
    'clusterNetworkHostPrefix',
  ]);
  const { addAlert, clearAlerts, alerts } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const dispatch = useDispatch();
  const hostSubnets = React.useMemo(() => getHostSubnets(cluster), [cluster]);
  const initialValues = React.useMemo(
    () => getNetworkInitialValues(cluster, defaultNetworkSettings),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // just once, Formik does not reinitialize
  );

  const initialTouched = React.useMemo(() => _.mapValues(initialValues, () => true), [
    initialValues,
  ]);

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
  }, [infraEnvError, addAlert]);

  const handleSubmit: FormikConfig<NetworkConfigurationValues>['onSubmit'] = async (
    values,
    actions,
  ) => {
    clearAlerts();

    // update the cluster configuration
    try {
      const isMultiNodeCluster = !isSingleNodeCluster(cluster);
      const isUserManagedNetworking = values.managedNetworkingType === 'userManaged';
      const params = _.omit(values, [
        'hostSubnet',
        'useRedHatDnsService',
        'managedNetworkingType',
        'machineNetworkCidr',
        'serviceNetworkCidr',
        'clusterNetworkCidr',
        'clusterNetworkHostPrefix',
      ]);
      params.userManagedNetworking = isUserManagedNetworking;
      params.clusterNetworks = [
        {
          cidr: values.clusterNetworkCidr,
          hostPrefix: values.clusterNetworkHostPrefix,
        },
      ];
      params.serviceNetworks = [
        {
          cidr: values.serviceNetworkCidr,
        },
      ];
      params.machineNetworks = [
        {
          cidr: hostSubnets.find((hn: HostSubnet) => hn.subnet === values.hostSubnet)?.subnet,
        },
      ];

      if (isUserManagedNetworking) {
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
        } else {
          delete params.machineNetworks;
        }
      }

      const { data } = await ClustersAPI.update(cluster.id, params);
      dispatch(updateCluster(data));
      actions.resetForm({ values: getNetworkInitialValues(data, defaultNetworkSettings) });
    } catch (e) {
      handleApiError(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
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
      {({ isSubmitting, dirty, errors, touched }: FormikProps<NetworkConfigurationValues>) => {
        const errorFields = getFormikErrorFields(errors, touched);
        const form = (
          <>
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
            <FormikAutoSave />
          </>
        );

        const footer = (
          <ClusterWizardFooter
            cluster={cluster}
            errorFields={errorFields}
            isSubmitting={isSubmitting}
            isNextDisabled={dirty || !canNextNetwork({ cluster })}
            onNext={() => setCurrentStepId('review')}
            onBack={() => setCurrentStepId('host-discovery')}
          />
        );
        return (
          <ClusterWizardStep
            navigation={<ClusterWizardNavigation cluster={cluster} />}
            footer={footer}
          >
            {form}
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

export default NetworkConfigurationForm;
