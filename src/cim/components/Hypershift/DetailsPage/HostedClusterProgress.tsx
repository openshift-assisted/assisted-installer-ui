import * as React from 'react';
import {
  ExpandableSectionToggle,
  ProgressStep,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  global_palette_green_500 as okColor,
  global_danger_color_100 as dangerColor,
} from '@patternfly/react-tokens';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
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

  const availableCondtion = hostedCluster.status?.conditions?.find((c) => c.type === 'Available');
  const progressingCondtion = hostedCluster.status?.conditions?.find(
    (c) => c.type === 'Progressing',
  );

  let progressIcon = <Spinner size="md" />;

  if (progressingCondtion?.status === 'False') {
    progressIcon =
      availableCondtion?.status === 'True' ? (
        <CheckCircleIcon color={okColor.value} />
      ) : (
        <ExclamationCircleIcon color={dangerColor.value} size="sm" />
      );
  }

  return (
    <ProgressStep icon={progressIcon}>
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
              <ConditionsTable
                conditions={hostedCluster.status?.conditions}
                isDone={progressingCondtion?.status === 'False'}
              />
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
