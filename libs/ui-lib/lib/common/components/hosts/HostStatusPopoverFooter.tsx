import React from 'react';
import hdate from 'human-date';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import { getHumanizedDateTime } from '../ui';
import OcpConsoleNodesSectionLink from './OcpConsoleNodesSectionLink';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export const HostStatusPopoverFooter: React.FC<{ host: Host }> = ({ host }) => {
  const { progress, statusUpdatedAt } = host;
  const { t } = useTranslation();

  if (host.status === 'added-to-existing-cluster') {
    return (
      <OcpConsoleNodesSectionLink
        id={`host-status-detail-link-to-ocp-nodes-${host.requestedHostname || host.id}`}
      />
    );
  }

  let footerText;
  if (host.status === 'installing-in-progress') {
    if (progress?.stageUpdatedAt && progress.stageUpdatedAt !== progress.stageStartedAt) {
      footerText = t('ai:Step started at {{startedAt}}, updated {{updatedAt}}', {
        startedAt: getHumanizedDateTime(progress.stageStartedAt),
        updatedAt: hdate.relativeTime(progress.stageUpdatedAt),
      });
    } else {
      footerText = t('ai:Step started at {{startedAt}}', {
        startedAt: getHumanizedDateTime(progress?.stageStartedAt || statusUpdatedAt),
      });
    }
  } else if (statusUpdatedAt) {
    footerText = t('ai:Status updated at {{humanizedDataTime}}', {
      humanizedDataTime: getHumanizedDateTime(statusUpdatedAt),
    });
  }

  return <>{!!footerText && <small>{footerText}</small>}</>;
};
