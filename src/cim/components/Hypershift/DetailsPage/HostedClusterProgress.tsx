import * as React from 'react';
import {
  ExpandableSectionToggle,
  ProgressStep,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { global_palette_green_500 as okColor } from '@patternfly/react-tokens';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { HostedClusterK8sResource } from '../types';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { ExternalLink } from '../../../../common';
import ConditionsTable from './ConditionsTable';

type HostedClusterProgressProps = {
  hostedCluster: HostedClusterK8sResource;
  launchToOCP: (urlSuffix: string, newTab: boolean) => void;
};

const HostedClusterProgress = ({ hostedCluster, launchToOCP }: HostedClusterProgressProps) => {
  const { t } = useTranslation();
  const [isExpanded, setExpanded] = React.useState(true);

  const hostedClusterAvailable =
    hostedCluster.status?.conditions?.find((c) => c.type === 'Available')?.status === 'True';

  return (
    <ProgressStep
      icon={
        hostedClusterAvailable ? <CheckCircleIcon color={okColor.value} /> : <Spinner size="md" />
      }
    >
      <Stack hasGutter>
        <StackItem>
          <ExpandableSectionToggle
            isExpanded={isExpanded}
            onToggle={setExpanded}
            className="ai-progress-item__header"
          >
            {t('ai:Control plane')}
          </ExpandableSectionToggle>
        </StackItem>
        {isExpanded && (
          <>
            <StackItem className="ai-progress-item__body">
              <ConditionsTable conditions={hostedCluster.status?.conditions} />
            </StackItem>
            <StackItem className="ai-progress-item__body">
              <ExternalLink
                onClick={() =>
                  launchToOCP(
                    `k8s/ns/${hostedCluster.metadata?.namespace || ''}-${
                      hostedCluster.metadata?.name || ''
                    }/pods`,
                    true,
                  )
                }
              >
                {t('ai:Control plane pods')}
              </ExternalLink>
            </StackItem>
          </>
        )}
      </Stack>
    </ProgressStep>
  );
};

export default HostedClusterProgress;
