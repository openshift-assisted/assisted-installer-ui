import { List, ListItem, TextContent } from '@patternfly/react-core';
import * as React from 'react';
import { fileSize } from './utils';
import ExternalLink from '../ui/ExternalLink';

type HWRequirements = {
  cpuCores?: number;
  ramMib?: number;
  diskSizeGb?: number;
};

const parseRAM = (req?: HWRequirements) =>
  fileSize((req?.ramMib || 16 * 1024) * 1024 * 1024, 2, 'iec');

export type HostRequirementsProps = {
  master?: HWRequirements;
  worker?: HWRequirements;
  sno?: HWRequirements;
  isSNOCluster?: boolean;
};

const HostRequirements: React.FC<HostRequirementsProps> = ({
  master,
  worker,
  sno,
  isSNOCluster,
}) => {
  const masterRam = parseRAM(master);
  const workerRam = parseRAM(worker);
  const snoRam = parseRAM(sno);
  return (
    <TextContent>
      <List>
        {!isSNOCluster && (
          <>
            <ListItem>
              Control plane nodes: At least {master?.cpuCores || 4} CPU cores, {masterRam} RAM,{' '}
              {master?.diskSizeGb || 120} GB disk size for every supervisor.
            </ListItem>
            <ListItem>
              Workers: At least {worker?.cpuCores || 2} CPU cores, {workerRam} RAM,{' '}
              {worker?.diskSizeGb || 120} GB disk size for each worker
            </ListItem>
          </>
        )}
        {(isSNOCluster === true || isSNOCluster === undefined) && (
          <>
            <ListItem>
              SNO: One host is required with at least {sno?.cpuCores || 4} CPU cores, {snoRam} of
              RAM, and {sno?.diskSizeGb || 120} GB of disk size storage.
            </ListItem>
          </>
        )}
        <ListItem>
          Also note that each hosts' disk write speed should meet the minimum requirements to run
          OpenShift.{' '}
          <ExternalLink href={'https://access.redhat.com/solutions/4885641'}>
            Learn more
          </ExternalLink>
        </ListItem>
      </List>
    </TextContent>
  );
};

export default HostRequirements;
