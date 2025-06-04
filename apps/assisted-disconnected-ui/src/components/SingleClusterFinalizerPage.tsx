import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  } from '@patternfly/react-core';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import {
  TroubleshootingOpenshiftConsoleButton,
  useTranslation,
} from '@openshift-assisted/ui-lib/common';

const SingleClusterFinalizerPage = ({
  cluster,
  consoleUrl,
}: {
  cluster: Cluster;
  consoleUrl?: string;
}) => {
  const { t } = useTranslation();
  return (
    <Bullseye>
      <EmptyState  headingLevel="h4"   titleText={t('ai:Finalizing')} variant={EmptyStateVariant.xl}>
        <EmptyStateBody>
          {t('ai:Cluster installation is still in-progress.')}
          <br />
          {t('ai:Click the webconsole URL below to check if it is up and running.')}
          <br />
          {t('ai:* If you close this browser window, you will not be able to return.')}
        </EmptyStateBody>
        <EmptyStateFooter>
          {consoleUrl && (
            <Button
              variant="link"
              onClick={() => window.open(consoleUrl, '_blank', 'noopener')}
              isInline
            >
              {consoleUrl}
            </Button>
          )}
          <TroubleshootingOpenshiftConsoleButton cluster={cluster} consoleUrl={consoleUrl} />
        </EmptyStateFooter>
      </EmptyState>
    </Bullseye>
  );
};

export default SingleClusterFinalizerPage;
