import * as React from 'react';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { global_palette_green_500 as okColor } from '@patternfly/react-tokens/dist/js/global_palette_green_500';
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { isInstallationReady } from './helpers';
import { AgentClusterInstallK8sResource } from '../../types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const GreenCheckCircleIcon: React.FC = (props) => (
  <CheckCircleIcon {...props} color={okColor.value} />
);

type ClusterDeploymentCreateProgressProps = {
  agentClusterInstall: AgentClusterInstallK8sResource;
  toDetails: VoidFunction;
  toListView: VoidFunction;
};

const ClusterDeploymentCreateProgress: React.FC<ClusterDeploymentCreateProgressProps> = ({
  agentClusterInstall,
  toDetails,
  toListView,
}) => {
  const { t } = useTranslation();
  return (
    <Bullseye>
      <EmptyState>
        {isInstallationReady(agentClusterInstall) ? (
          <>
            <EmptyStateIcon icon={GreenCheckCircleIcon} />
            <Title headingLevel="h4" size="lg">
              {t('ai:Cluster is ready for installation')}
            </Title>
            <EmptyStateBody>
              <div>{t('ai:This cluster has been created and is ready to begin installation.')}</div>
              <div>{t('ai:To see the status of the installation see the details page.')}</div>
            </EmptyStateBody>
          </>
        ) : (
          <>
            <EmptyStateIcon icon={Spinner} />
            <Title headingLevel="h4" size="lg">
              {t('ai:Preparing cluster installation')}
            </Title>
            <EmptyStateBody>
              <div>
                {t('ai:This cluster is in the process of getting ready to start installation.')}
              </div>
              <div>
                {t(
                  'ai:If you exit this flow you can see its status in the list view or details page.',
                )}
              </div>
            </EmptyStateBody>
          </>
        )}
        <EmptyStateSecondaryActions>
          <Button variant="primary" onClick={toDetails}>
            {t('ai:See cluster details')}
          </Button>
          <Button variant="link" onClick={toListView}>
            {t('ai:Go to cluster list')}
          </Button>
        </EmptyStateSecondaryActions>
      </EmptyState>
    </Bullseye>
  );
};

export default ClusterDeploymentCreateProgress;
