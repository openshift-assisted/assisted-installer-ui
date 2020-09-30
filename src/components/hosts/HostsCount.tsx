import React from 'react';
import { Popover, Level, LevelItem } from '@patternfly/react-core';
import { Host } from '../../api/types';

type HostsCountProps = {
  hosts?: Host[];
  inParenthesis?: boolean;
  valueId?: string;
};

export const getEnabledHostsCount = (hosts: Host[] = []) =>
  hosts.filter((h) => h.status != 'disabled').length;

const HostsCount: React.FC<HostsCountProps> = ({
  hosts = [],
  inParenthesis = false,
  valueId = 'hosts-count',
}) => {
  const hostsDiscovered = hosts.length;
  const hostsIncluded = getEnabledHostsCount(hosts);

  const body = (
    <>
      <Level>
        <LevelItem>Included in the installation</LevelItem>
        <LevelItem>{hostsIncluded}</LevelItem>
      </Level>
      <Level>
        <LevelItem>Discovered</LevelItem>
        <LevelItem>{hostsDiscovered}</LevelItem>
      </Level>
    </>
  );

  return (
    <Popover headerContent="Hosts in the cluster" bodyContent={body}>
      <a id={valueId}>
        {inParenthesis && '('}
        {hostsIncluded}
        {inParenthesis && ')'}
      </a>
    </Popover>
  );
};

export default HostsCount;
