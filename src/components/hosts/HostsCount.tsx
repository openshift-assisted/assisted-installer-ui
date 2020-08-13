import React from 'react';
import { Popover, Level, LevelItem } from '@patternfly/react-core';
import { Host } from '../../api/types';

type HostsCountProps = {
  hosts?: Host[];
};

const HostsCount: React.FC<HostsCountProps> = ({ hosts = [] }) => {
  const hostsDiscovered = hosts.length;
  const hostsIncluded = hosts.filter((h) => h.status != 'disabled').length;

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
    <>
      <Popover headerContent="Hosts in the cluster" bodyContent={body}>
        <a>({hostsIncluded})</a>
      </Popover>
    </>
  );
};

export default HostsCount;
