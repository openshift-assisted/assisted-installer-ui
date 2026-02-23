import * as React from 'react';
import {
  ClusterWizardStep,
  TechnologyPreview,
  ExternalLink,
  OCP_RELEASES_PAGE,
  StaticTextField,
  useTranslation,
} from '../../../../common';
import { Flex, Grid, GridItem, Form, Content, Spinner } from '@patternfly/react-core';
import OcmOpenShiftVersion from '../../clusterConfiguration/OcmOpenShiftVersion';
import { useClusterWizardContext } from '../ClusterWizardContext';
import ClusterWizardFooter from '../ClusterWizardFooter';
import ClusterWizardNavigation from '../ClusterWizardNavigation';
import { WithErrorBoundary } from '../../../../common/components/ErrorHandling/WithErrorBoundary';
import InstallDisconnectedSwitch from './InstallDisconnectedSwitch';
import { Formik, useFormikContext } from 'formik';
import ClustersService from '../../../services/ClustersService';
import { handleApiError, getApiErrorMessage } from '../../../../common/api';
import { useAlerts } from '../../../../common/components/AlertsContextProvider';
import { AlertVariant } from '@patternfly/react-core';
import { ClusterWizardFlowStateNew } from '../wizardTransition';
import { useLocation, useNavigate, useParams } from 'react-router-dom-v5-compat';
import { AxiosResponse } from 'axios';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import OcmOpenShiftVersionSelect from '../../clusterConfiguration/OcmOpenShiftVersionSelect';

type BasicStepFormikValues = {
  openshiftVersion: string;
  customOpenshiftSelect: string | null;
};

const BasicStepForm = () => {
  const { clusterId } = useParams<{ clusterId: string }>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [cluster, setCluster] = React.useState<Cluster>();

  const { values } = useFormikContext<BasicStepFormikValues>();
  const { t } = useTranslation();
  const { moveNext } = useClusterWizardContext();
  const { addAlert } = useAlerts();
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

  const createCluster = async () => {
    try {
      setIsSubmitting(true);
      // Create cluster only - infraEnv will be created in OptionalConfigurationsStep
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data: disconnectedCluster }: AxiosResponse<Cluster> =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await ClustersService.registerDisconnected({
          name: 'disconnected-cluster',
          openshiftVersion: '4.20',
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
    <Formik
      initialValues={{}}
      onSubmit={() => {
        // nothing to do
      }}
    >
      <ClusterWizardStep
        navigation={<ClusterWizardNavigation />}
        footer={
          <ClusterWizardFooter
            onNext={() => {
              void onNext();
            }}
            isSubmitting={isSubmitting}
            disconnectedClusterId={disconnectedClusterId}
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
                <TechnologyPreview />
                <InstallDisconnectedSwitch />
                <span>
                  {t("ai:I'm installing on a disconnected/air-gapped/secured environment")}
                </span>
              </Flex>
            </GridItem>
            <GridItem>
              <Form id="wizard-cluster-basic-info__form">
                <OcmOpenShiftVersion openshiftVersion="4.20" withPreviewText withMultiText>
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
            </Form>
          </GridItem>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

const BasicStep = () => {
  return (
    <Formik<BasicStepFormikValues>
      initialValues={{
        openshiftVersion: '',
        customOpenshiftSelect: null,
      }}
      onSubmit={() => {
        // nothing to do
      }}
    >
      <BasicStepForm />
    </Formik>
  );
};

export default BasicStep;
