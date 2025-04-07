import React from 'react';
import {
  ClusterCredentials,
  ClustersAPI,
  ClusterWizardStep,
  ClusterWizardStepHeader,
  getApiErrorMessage,
  handleApiError,
  useAlerts,
  useTranslation,
} from '../../../common';
import { useClusterWizardContext } from './ClusterWizardContext';
import ClusterWizardFooter from './ClusterWizardFooter';
import ClusterWizardNavigation from './ClusterWizardNavigation';
import { WithErrorBoundary } from '../../../common/components/ErrorHandling/WithErrorBoundary';
import { Cluster, Credentials } from '@openshift-assisted/types/assisted-installer-service';
import { Alert, AlertVariant, Button, ButtonVariant, Checkbox, Grid } from '@patternfly/react-core';
import { downloadFile, getErrorMessage } from '../../../common/utils';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

const CredentialsDownload: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const [isChecked, setIsChecked] = React.useState<boolean>(false);
  const clusterWizardContext = useClusterWizardContext();
  const [credentials, setCredentials] = React.useState<Credentials>();
  const [credentialsError, setCredentialsError] = React.useState('');
  const [isDownloading, setIsDownloading] = React.useState(false);
  const { addAlert } = useAlerts();
  const { t } = useTranslation();

  // ==========  mocks  =============
  const username = 'elay';
  const password = 'password';
  const credentialsData = { username, password };

  // const fetchCredentials = React.useCallback(() => {
  //   const fetch = async () => {
  //     setCredentialsError('');
  //     if (!cluster.id) {
  //       return;
  //     }
  //     try {
  //       const response = await ClustersAPI.getCredentials(cluster.id);
  //       setCredentials(response.data);
  //     } catch (err) {
  //       setCredentialsError(getErrorMessage(err));
  //     }
  //   };
  //   void fetch();
  // }, [cluster]);

  // React.useEffect(() => {
  //   fetchCredentials();
  // }, [fetchCredentials]);

  const downloadFiles = async () => {
    setIsDownloading(true);
    try {
      const response = await ClustersAPI.downloadClusterCredentials(cluster.id, 'kubeconfig');
      downloadFile('', response.data, 'kubeconfig');
    } catch (e) {
      handleApiError(e, (e) => {
        addAlert({
          title: t('ai:Could not download kubeconfig'),
          message: getApiErrorMessage(e),
        });
      });
    }
    try {
      const response2 = await ClustersAPI.downloadClusterCredentials(
        cluster.id,
        'kubeadmin-password',
      );
      downloadFile('', response2.data, 'credentials');
    } catch (e) {
      handleApiError(e, (e) => {
        addAlert({
          title: t('ai:Could not download credentials'),
          message: getApiErrorMessage(e),
        });
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadClick = () => {
    void downloadFiles();
    !isDownloading && clusterWizardContext.moveNext();
  };

  const footer = (
    <ClusterWizardFooter
      cluster={cluster}
      onNext={handleDownloadClick}
      onBack={() => clusterWizardContext.moveBack()}
      isNextDisabled={!isChecked || isDownloading}
      nextButtonText="Download credentials"
    />
  );

  return (
    <ClusterWizardStep navigation={<ClusterWizardNavigation cluster={cluster} />} footer={footer}>
      <WithErrorBoundary title={t('ai:Failed to load Credentials Download step')}>
        <ClusterWizardStepHeader>Download credentials</ClusterWizardStepHeader>
        <Alert
          style={{ marginTop: '20px', marginBottom: '20px' }}
          title={t('ai:Make sure you download and store your credentials files in a safe place')}
          variant={AlertVariant.warning}
          isInline
          actionLinks={
            <Button variant={ButtonVariant.link} onClick={() => console.log('hi')} isInline>
              {t('ai:Learn more about Kubeconfig')}
              <ExternalLinkAltIcon style={{ marginLeft: '8px' }} />
            </Button>
          }
        >
          You should use your cluster's Kubeconfig file to gain access to the cluster.
          <br />
          You can use username and password to log-in to your console through the UI.
        </Alert>
        <Checkbox
          style={{ marginBottom: '50px' }}
          id="credentials-download-agreement"
          isChecked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
          label={t(
            'ai:I understand that I need to download credentials files prior of proceeding with the cluster installation.',
          )}
        />
        <Grid style={{ justifyItems: 'start' }}>
          <ClusterCredentials
            cluster={cluster}
            credentials={credentialsData}
            credentialsError={'error'}
          />
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

export default CredentialsDownload;
