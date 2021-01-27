import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik, FormikProps, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import _ from 'lodash';
import {
  Cluster,
  ClusterUpdateParams,
  getErrorMessage,
  handleApiError,
  patchCluster,
} from '../../api';
import { Form, Grid, GridItem, Stack, StackItem, Text, TextContent } from '@patternfly/react-core';

import { trimSshPublicKey } from '../ui/formik/utils';
import { AlertsContext } from '../AlertsContextProvider';
import Alerts from '../ui/Alerts';
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
import { canNextNetwork, canNextNetworkBackend } from '../clusterWizard/wizardTransition';
import ClusterWizardContext from '../clusterWizard/ClusterWizardContext';
import NetworkConfiguration from './NetworkConfiguration';
import ClusterSshKeyField from './ClusterSshKeyField';
import { getHostSubnets, getNetworkInitialValues } from './utils';
import { useDefaultConfiguration } from './ClusterDefaultConfigurationContext';

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
  /* TODO(mlibra): Refactor alerts section along the butons
    const [isValidationSectionOpen, setIsValidationSectionOpen] = React.useState(false);
  const [isStartingInstallation, setIsStartingInstallation] = React.useState(false);
  */
  const { alerts, addAlert, clearAlerts } = React.useContext(AlertsContext);
  const defaultNetworkSettings = useDefaultConfiguration([
    'clusterNetworkCidr',
    'serviceNetworkCidr',
    'clusterNetworkHostPrefix',
  ]);
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

  const handleSubmit = async (
    values: NetworkConfigurationValues,
    formikActions: FormikHelpers<NetworkConfigurationValues>,
  ) => {
    clearAlerts();

    // update the cluster configuration
    try {
      const params = _.omit(values, ['hostSubnet', 'useRedHatDnsService', 'shareDiscoverySshKey']);

      if (values.shareDiscoverySshKey) {
        params.sshPublicKey = cluster.imageInfo.sshPublicKey;
      }

      if (values.vipDhcpAllocation) {
        delete params.apiVip;
        delete params.ingressVip;
        const cidr = hostSubnets.find((hn) => hn.humanized === values.hostSubnet)?.subnet;
        params.machineNetworkCidr = cidr;
      }

      const { data } = await patchCluster(cluster.id, params);
      formikActions.resetForm({
        values: getNetworkInitialValues(data, defaultNetworkSettings),
      });
      dispatch(updateCluster(data));

      canNextNetworkBackend({ cluster }) && setCurrentStepId('review');
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
      {({
        isSubmitting,
        isValid,
        dirty,
        values,
        errors,
        submitForm,
        setFieldValue,
      }: FormikProps<NetworkConfigurationValues>) => {
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
            setFieldValue('sshPublicKey', trimSshPublicKey(values.sshPublicKey));
          }
        };

        const form = (
          <Grid hasGutter>
            <GridItem span={12} lg={10} xl={9} xl2={7}>
              <Form>
                <NetworkConfiguration cluster={cluster} hostSubnets={hostSubnets} />
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
              </Form>
            </GridItem>
          </Grid>
        );

        const footer = (
          <Stack hasGutter>
            {!!alerts.length && (
              <StackItem>
                <Alerts />
              </StackItem>
            )}
            <StackItem>
              <ClusterWizardToolbar
                cluster={cluster}
                errors={errors}
                dirty={dirty}
                isSubmitting={isSubmitting}
                isNextDisabled={!canNextNetwork({ isValid, isSubmitting, cluster })}
                onNext={submitForm}
                onBack={() => setCurrentStepId('cluster-configuration')}
              />
            </StackItem>
          </Stack>
        );
        return <ClusterWizardStep footer={footer}>{form}</ClusterWizardStep>;
      }}
    </Formik>
  );
};

export default NetworkConfigurationForm;
