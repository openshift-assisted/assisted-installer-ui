import * as React from 'react';
import * as Yup from 'yup';
import {
  ClusterWizardStep,
  TechnologyPreview,
  ExternalLink,
  OCP_RELEASES_PAGE,
  StaticTextField,
  useTranslation,
  PullSecret,
  pullSecretValidationSchema,
} from '../../../../common';
import { Flex, Grid, GridItem, Form, Content, Spinner, Alert } from '@patternfly/react-core';
import OcmOpenShiftVersion from '../../clusterConfiguration/OcmOpenShiftVersion';
import { useClusterWizardContext } from '../ClusterWizardContext';
import ClusterWizardFooter from '../ClusterWizardFooter';
import ClusterWizardNavigation from '../ClusterWizardNavigation';
import { WithErrorBoundary } from '../../../../common/components/ErrorHandling/WithErrorBoundary';
import InstallDisconnectedSwitch from './InstallDisconnectedSwitch';
import { Formik, useFormikContext } from 'formik';
import ClustersService from '../../../services/ClustersService';
import InfraEnvsService from '../../../services/InfraEnvsService';
import { handleApiError, getApiErrorMessage } from '../../../../common/api';
import { useAlerts } from '../../../../common/components/AlertsContextProvider';
import { AlertVariant } from '@patternfly/react-core';
import { ClusterWizardFlowStateNew } from '../wizardTransition';
import { useLocation, useNavigate, useParams } from 'react-router-dom-v5-compat';
import { AxiosResponse } from 'axios';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import OcmOpenShiftVersionSelect from '../../clusterConfiguration/OcmOpenShiftVersionSelect';
import usePullSecret from '../../../hooks/usePullSecret';
import { isInOcm } from '../../../../common/api';

const DISCONNECTED_IMAGE_TYPE = 'disconnected-iso';

type BasicStepFormikValues = {
  openshiftVersion: string;
  customOpenshiftSelect: string | null;
  pullSecret?: string;
};

const BasicStepForm = () => {
  const { clusterId } = useParams<{ clusterId: string }>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [cluster, setCluster] = React.useState<Cluster>();

  const { values, isValid, setFieldValue } = useFormikContext<BasicStepFormikValues>();
  const { t } = useTranslation();
  const { moveNext, setDisconnectedInfraEnv, disconnectedInfraEnv } = useClusterWizardContext();
  const { addAlert } = useAlerts();
  const defaultPullSecret = usePullSecret();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  React.useEffect(() => {
    if (!clusterId) {
      setIsLoading(false);
    } else {
      void (async () => {
        setIsLoading(true);
        try {
          setCluster(await ClustersService.get(clusterId));
        } catch (error) {
          handleApiError(error, () => {
            addAlert({
              title: 'Failed to fetch disconnected cluster',
              message: getApiErrorMessage(error),
              variant: AlertVariant.danger,
            });
          });
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [clusterId, addAlert]);

  // When returning to Basic with existing cluster, sync openshiftVersion so validation passes
  // and Next can be enabled once pull secret is filled
  React.useEffect(() => {
    if (cluster?.openshiftVersion && values.openshiftVersion !== cluster.openshiftVersion) {
      setFieldValue('openshiftVersion', cluster.openshiftVersion);
    }
  }, [cluster?.openshiftVersion, values.openshiftVersion, setFieldValue]);

  const createClusterAndInfraEnv = async () => {
    try {
      setIsSubmitting(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data: disconnectedCluster }: AxiosResponse<Cluster> =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await ClustersService.registerDisconnected({
          name: 'disconnected-cluster',
          openshiftVersion: values.openshiftVersion,
        });
      const pullSecretToUse = (isInOcm ? defaultPullSecret : values.pullSecret) ?? '';
      const createdInfraEnv = await InfraEnvsService.create({
        name: InfraEnvsService.makeInfraEnvName(
          disconnectedCluster.cpuArchitecture as string,
          disconnectedCluster.name,
        ),
        clusterId: disconnectedCluster.id,
        openshiftVersion: disconnectedCluster.openshiftVersion,
        cpuArchitecture: disconnectedCluster.cpuArchitecture,
        imageType: DISCONNECTED_IMAGE_TYPE,
        pullSecret: pullSecretToUse,
      });
      setDisconnectedInfraEnv({
        ...createdInfraEnv,
        openshiftVersion: disconnectedCluster.openshiftVersion,
      });
      navigate(`${currentPath}/${disconnectedCluster.id}`, {
        state: ClusterWizardFlowStateNew,
      });
      moveNext();
    } catch (error: unknown) {
      handleApiError(error, () => {
        addAlert({
          title: 'Failed to create disconnected cluster',
          message: getApiErrorMessage(error),
          variant: AlertVariant.danger,
        });
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation />}
      footer={
        <ClusterWizardFooter
          onNext={() => {
            clusterId ? moveNext() : void createClusterAndInfraEnv();
          }}
          isSubmitting={isSubmitting}
          isNextDisabled={
            isLoading ||
            (cluster ? false : !values.openshiftVersion) ||
            (!isInOcm && !isValid && !disconnectedInfraEnv?.pullSecretSet)
          }
          disconnectedClusterId={clusterId}
        />
      }
    >
      <WithErrorBoundary title="Failed to load Basic step">
        <Grid hasGutter>
          <GridItem>
            <Content component="h2">Basic information</Content>
          </GridItem>
          <GridItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <InstallDisconnectedSwitch isDisabled={!!clusterId} />
              <span>{t("ai:I'm installing on a disconnected/air-gapped/secured environment")}</span>
              <TechnologyPreview />
            </Flex>
          </GridItem>
          <GridItem>
            <Form id="wizard-cluster-basic-info__form">
              {isLoading ? (
                <Spinner />
              ) : cluster ? (
                <OcmOpenShiftVersion
                  openshiftVersion={cluster.openshiftVersion || ''}
                  withPreviewText
                  withMultiText
                >
                  <ExternalLink href={`${window.location.origin}/${OCP_RELEASES_PAGE}`}>
                    <span data-ouia-id="openshift-releases-link">
                      {t('ai:Learn more about OpenShift releases')}
                    </span>
                  </ExternalLink>
                </OcmOpenShiftVersion>
              ) : (
                <OcmOpenShiftVersionSelect minVersionAllowed={4021} />
              )}
              <StaticTextField name="cpuArchitecture" label="CPU architecture" isRequired>
                x86_64
              </StaticTextField>
              {/* Always show pull secret when !isInOcm so it can be re-entered after going back */}
              {!isInOcm && !disconnectedInfraEnv?.pullSecretSet ? (
                <PullSecret defaultPullSecret={defaultPullSecret} isOcm={false} />
              ) : (
                <Alert
                  variant={AlertVariant.success}
                  isInline
                  title={t('ai:Pull secret configured')}
                >
                  {t(
                    'ai:A pull secret has already been set for this cluster. You can continue to the next step.',
                  )}
                </Alert>
              )}
            </Form>
          </GridItem>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

const BASIC_STEP_DEFAULT_VALUES: BasicStepFormikValues = {
  openshiftVersion: '',
  customOpenshiftSelect: null,
  pullSecret: '',
};

const getBasicStepValidationSchema = (t: ReturnType<typeof useTranslation>['t']) =>
  Yup.object().shape({
    openshiftVersion: Yup.string().required(),
    customOpenshiftSelect: Yup.string().nullable(),
    ...(!isInOcm && {
      pullSecret: pullSecretValidationSchema(t).required(t('ai:Required field')),
    }),
  });

const BasicStep = () => {
  const { t } = useTranslation();
  return (
    <Formik<BasicStepFormikValues>
      initialValues={BASIC_STEP_DEFAULT_VALUES}
      validationSchema={getBasicStepValidationSchema(t)}
      validateOnMount
      validateOnChange
      validateOnBlur
      onSubmit={() => {
        // No persistence until Next (create cluster + infraEnv)
      }}
    >
      <BasicStepForm />
    </Formik>
  );
};

export default BasicStep;
