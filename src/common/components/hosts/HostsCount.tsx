import React from 'react';
import { Popover, Level, LevelItem } from '@patternfly/react-core';
import { Cluster } from '../../api';
import { getEnabledHostCount, getReadyHostCount, getTotalHostCount } from './utils';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type HostsCountProps = {
  cluster: Cluster;
  inParenthesis?: boolean;
  valueId?: string;
};

const HostsCount: React.FC<HostsCountProps> = ({
  cluster,
  inParenthesis = false,
  valueId = 'hosts-count',
}) => {
  const { t } = useTranslation();
  const body = (
    <>
      {'readyHostCount' in cluster && (
        <Level>
          <LevelItem>{t('ai:Ready for the installation')}</LevelItem>
          <LevelItem>{getReadyHostCount(cluster)}</LevelItem>
        </Level>
      )}
      {'enabledHostCount' in cluster && (
        <Level>
          <LevelItem>{t('ai:Enabled for the installation')}</LevelItem>
          <LevelItem>{getEnabledHostCount(cluster)}</LevelItem>
        </Level>
      )}
      <Level>
        <LevelItem>{t('ai:All discovered')}</LevelItem>
        <LevelItem>{getTotalHostCount(cluster)}</LevelItem>
      </Level>
    </>
  );

  const summary =
    'enabledHostCount' in cluster ? getEnabledHostCount(cluster) : getTotalHostCount(cluster);
  return (
    <Popover headerContent={t('ai:Hosts in the cluster')} bodyContent={body}>
      <a id={valueId}>
        {inParenthesis && '('}
        {summary}
        {inParenthesis && ')'}
      </a>
    </Popover>
  );
};

export default HostsCount;
