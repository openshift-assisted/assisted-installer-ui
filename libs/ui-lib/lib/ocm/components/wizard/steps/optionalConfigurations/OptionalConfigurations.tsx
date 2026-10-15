import React from 'react';
import * as Yup from 'yup';
import { Formik, FormikConfig, useFormikContext } from 'formik';
import { useDispatch } from 'react-redux';
import { AlertVariant, Form, Grid, GridItem } from '@patternfly/react-core';
import {
  Cluster,
  InfraEnv,
  InfraEnvUpdateParams,
  V2ClusterUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';
import {
  ClusterWizardStep,
  ClusterWizardStepHeader,
  getApiErrorMessage,
  getFormikErrorFields,
  handleApiError,
  httpProxyValidationSchema,
  httpsProxyValidationSchema,
  isUnknownServerError,
  noProxyValidationSchema,
  NtpSourcesFields,
  NtpSourcesFieldsType,
  ntpSourceValidationSchema,
  ProxyFields,
  ProxyFieldsType,
  trimCommaSeparatedList,
  useAlerts,
  useFormikAutoSave,
  useTranslation,
  WithErrorBoundary,
} from '../../../../../common';
import { ClustersService } from '../../../../services';
import { setServerUpdateError, updateCluster } from '../../../../store';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { ClusterWizardFooter, ClusterWizardNavigation } from '../../wizardComponents';

type OptionalConfigurationsValues = ProxyFieldsType & NtpSourcesFieldsType;

type OptionalConfigurationsProps = {
  cluster: Cluster;
  infraEnv: InfraEnv;
  updateInfraEnv: (infraEnvUpdateParams: InfraEnvUpdateParams) => Promise<InfraEnv>;
};

const getNtpSources = (values: OptionalConfigurationsValues): string =>
  values.enableNtpSources && values.ntpSourcesList
    ? trimCommaSeparatedList(values.ntpSourcesList)
    : '';

const getInitialValues = (infraEnv: InfraEnv): OptionalConfigurationsValues => ({
  enableProxy: !!(
    infraEnv.proxy?.httpProxy ||
    infraEnv.proxy?.httpsProxy ||
    infraEnv.proxy?.noProxy
  ),
  httpProxy: infraEnv.proxy?.httpProxy ?? '',
  httpsProxy: infraEnv.proxy?.httpsProxy ?? '',
  noProxy: infraEnv.proxy?.noProxy ?? '',
  enableNtpSources: !!infraEnv.ntpSources?.trim(),
  ntpSourcesList: infraEnv.ntpSources ?? '',
});

const OptionalConfigurationsForm = ({ cluster }: { cluster: Cluster }) => {
  const { alerts } = useAlerts();
  const clusterWizardContext = useClusterWizardContext();
  const { errors, touched, isSubmitting, isValid } =
    useFormikContext<OptionalConfigurationsValues>();
  const isAutoSaveRunning = useFormikAutoSave();
  const errorFields = getFormikErrorFields(errors, touched);

  const isNextDisabled = !isValid || !!alerts.length || isAutoSaveRunning || isSubmitting;

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation cluster={cluster} />}
      footer={
        <ClusterWizardFooter
          cluster={cluster}
          errorFields={errorFields}
          isSubmitting={isSubmitting}
          isNextDisabled={isNextDisabled}
          onNext={() => clusterWizardContext.moveNext()}
          onBack={() => clusterWizardContext.moveBack()}
          isBackDisabled={isSubmitting || isAutoSaveRunning}
        />
      }
    >
      <WithErrorBoundary title="Failed to load Optional configurations step">
        <Grid hasGutter>
          <GridItem>
            <ClusterWizardStepHeader>Optional configurations</ClusterWizardStepHeader>
          </GridItem>
          <GridItem>
            <Form id="wizard-cluster-optional-config__form">
              <ProxyFields />
              <NtpSourcesFields />
            </Form>
          </GridItem>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

export const OptionalConfigurations = ({
  cluster,
  infraEnv,
  updateInfraEnv,
}: OptionalConfigurationsProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { addAlert, clearAlerts } = useAlerts();

  const initialValues = React.useMemo(
    () => getInitialValues(infraEnv),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // just once, Formik does not reinitialize
  );

  const validationSchema = React.useMemo(
    () =>
      Yup.lazy((values: OptionalConfigurationsValues) =>
        Yup.object({
          httpProxy: httpProxyValidationSchema({
            values,
            pairValueName: 'httpsProxy',
            t,
          }),
          httpsProxy: httpsProxyValidationSchema({
            values,
            pairValueName: 'httpProxy',
            t,
          }),
          noProxy: noProxyValidationSchema(t),
          ntpSourcesList: values.enableNtpSources
            ? ntpSourceValidationSchema(t, false)
            : ntpSourceValidationSchema(t),
        }),
      ),
    [t],
  );

  const handleSubmit: FormikConfig<OptionalConfigurationsValues>['onSubmit'] = async (values) => {
    clearAlerts();

    const ntpSources = getNtpSources(values);
    const clusterParams: V2ClusterUpdateParams = {
      httpProxy: values.httpProxy,
      httpsProxy: values.httpsProxy,
      noProxy: values.noProxy,
      ntpSources,
    };
    const infraEnvParams: InfraEnvUpdateParams = {
      proxy: {
        httpProxy: values.httpProxy,
        httpsProxy: values.httpsProxy,
        noProxy: values.noProxy,
      },
      ntpSources,
    };

    try {
      const { data: updatedCluster } = await ClustersService.update(
        cluster.id,
        cluster.tags,
        clusterParams,
      );
      await updateInfraEnv(infraEnvParams);
      dispatch(updateCluster(updatedCluster));
    } catch (e) {
      handleApiError(e, () =>
        addAlert({
          title: 'Failed to save optional configurations',
          message: getApiErrorMessage(e),
          variant: AlertVariant.danger,
        }),
      );
      if (isUnknownServerError(e as Error)) {
        dispatch(setServerUpdateError());
      }
    }
  };

  return (
    <Formik<OptionalConfigurationsValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnMount
      onSubmit={handleSubmit}
    >
      <OptionalConfigurationsForm cluster={cluster} />
    </Formik>
  );
};

export default OptionalConfigurations;
