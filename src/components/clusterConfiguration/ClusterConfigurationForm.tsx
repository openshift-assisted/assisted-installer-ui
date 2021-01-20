import React from 'react';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import _ from 'lodash';
import { Form, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import { useDispatch } from 'react-redux';

import { InputField } from '../ui/formik';
import GridGap from '../ui/GridGap';
import { Cluster, ClusterUpdateParams } from '../../api/types';
import { patchCluster, getClusters } from '../../api/clusters';
import { handleApiError, getErrorMessage } from '../../api/utils';
import Alerts from '../ui/Alerts';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import BaremetalInventory from './BaremetalInventory';
import { nameValidationSchema } from '../ui/formik/validationSchemas';
import { BareMetalDiscoveryValues } from '../../types/clusters';
import { AlertsContext } from '../AlertsContextProvider';
import { captureException } from '../../sentry';
import { getOlmOperatorsByName } from '../clusters/utils';
import ClusterWizardStep from '../clusterWizard/ClusterWizardStep';
import ClusterWizardToolbar from '../clusterWizard/ClusterWizardToolbar';
import ClusterWizardContext from '../clusterWizard/ClusterWizardContext';
import {
  canNextClusterConfiguration,
  canNextClusterConfigurationBackend,
} from '../clusterWizard/wizardTransition';
import { getBareMetalDiscoveryInitialValues } from './utils';

const validationSchema = Yup.object<BareMetalDiscoveryValues>().shape({
  name: nameValidationSchema,
});

const ClusterConfigurationForm: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const { alerts, addAlert, clearAlerts } = React.useContext(AlertsContext);
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const dispatch = useDispatch();

  const initialValues = React.useMemo(() => getBareMetalDiscoveryInitialValues(cluster), [cluster]);

  const handleSubmit = async (
    values: BareMetalDiscoveryValues,
    formikActions: FormikHelpers<BareMetalDiscoveryValues>,
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

    try {
      const params = _.omit(values, ['hostSubnet', 'useRedHatDnsService', 'shareDiscoverySshKey']);

      const enabledOlmOperatorsByName = getOlmOperatorsByName(cluster);

      if (values.useExtraDisksForLocalStorage) {
        enabledOlmOperatorsByName.ocs = { name: 'ocs' };
      } else {
        delete enabledOlmOperatorsByName.ocs;
      }
      params.olmOperators = Object.values(enabledOlmOperatorsByName);

      const { data } = await patchCluster(cluster.id, params);
      formikActions.resetForm({
        values: getBareMetalDiscoveryInitialValues(data),
      });
      dispatch(updateCluster(data));
      formikActions.resetForm({
        values: getBareMetalDiscoveryInitialValues(data),
      });

      canNextClusterConfigurationBackend({ cluster }) && setCurrentStepId('networking');
    } catch (e) {
      handleApiError<ClusterUpdateParams>(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
      );
    }
  };

  /* REMOVE once implemented in the Summary step
  const handleClusterInstall = () => {};
  
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
*/
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      initialTouched={_.mapValues(initialValues, () => true)}
      validateOnMount
    >
      {({
        isSubmitting,
        isValid,
        dirty,
        errors,
        submitForm,
      }: FormikProps<BareMetalDiscoveryValues>) => {
        const form = (
          <Form>
            {/* TODO(mlibra): unify structure accross steps - see NetworkConfigurationForm */}
            <Grid hasGutter>
              <GridItem span={12} lg={10} xl={6}>
                {/* TODO(jtomasek): remove this if we're not putting full width content here (e.g. hosts table)*/}
                <GridGap>
                  <InputField label="Cluster Name" name="name" isRequired />
                </GridGap>
              </GridItem>
              <GridItem span={12}>
                <GridGap>
                  <BaremetalInventory cluster={cluster} />
                </GridGap>
              </GridItem>
            </Grid>
          </Form>
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
                isNextDisabled={!canNextClusterConfiguration({ isValid, isSubmitting, cluster })}
                onNext={submitForm}
                onBack={() => setCurrentStepId('cluster-details')}
              />
            </StackItem>
          </Stack>
        );

        return <ClusterWizardStep footer={footer}>{form}</ClusterWizardStep>;
      }}
    </Formik>
  );
};

export default ClusterConfigurationForm;
