import * as React from 'react';
import {
  ClusterWizardStep,
  TechnologyPreview,
  ExternalLink,
  OCP_RELEASES_PAGE,
  StaticTextField,
  useTranslation,
} from '../../../../common';
import { Flex, Grid, GridItem, Form, Content } from '@patternfly/react-core';
import OcmOpenShiftVersion from '../../clusterConfiguration/OcmOpenShiftVersion';
import { useClusterWizardContext } from '../ClusterWizardContext';
import ClusterWizardFooter from '../ClusterWizardFooter';
import ClusterWizardNavigation from '../ClusterWizardNavigation';
import { WithErrorBoundary } from '../../../../common/components/ErrorHandling/WithErrorBoundary';
import InstallDisconnectedSwitch from './InstallDisconnectedSwitch';

const BasicStep = () => {
  const { t } = useTranslation();
  const { moveNext } = useClusterWizardContext();
  const { addAlert } = useAlerts();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  let disconnectedClusterId: string | undefined;

  const onNext = async () => {
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
      disconnectedClusterId = disconnectedCluster.id;
      navigate(`${currentPath}/${disconnectedClusterId}`, {
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
        footer={<ClusterWizardFooter onNext={moveNext} />}
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
                <StaticTextField name="cpuArchitecture" label="CPU architecture" isRequired>
                  x86_64
                </StaticTextField>
              </Form>
            </GridItem>
          </Grid>
        </WithErrorBoundary>
      </ClusterWizardStep>
    </Formik>
  );
};

export default BasicStep;
