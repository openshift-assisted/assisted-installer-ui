import { List, ListItem, Content } from '@patternfly/react-core';
import * as React from 'react';
import ExternalLink from '../ui/ExternalLink';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { fileSize } from '../../utils';
import { HOST_REQUIREMENTS_LINK } from '../../config/docs_links';

type HWRequirements = {
  cpuCores?: number;
  ramMib?: number;
  diskSizeGb?: number;
};

const parseRAM = (req?: HWRequirements) =>
  fileSize((req?.ramMib || 16 * 1024) * 1024 * 1024, 2, 'iec');

export type HostRequirementsListProps = {
  master?: HWRequirements;
  worker?: HWRequirements;
  sno?: HWRequirements;
  isSNOCluster?: boolean;
};

export const HostRequirementsList: React.FC<HostRequirementsListProps> = ({
  master,
  worker,
  sno,
  isSNOCluster,
}) => {
  const masterRam = parseRAM(master);
  const workerRam = parseRAM(worker);
  const snoRam = parseRAM(sno);
  const { t } = useTranslation();
  return (
    <List>
      {!isSNOCluster && (
        <>
          <ListItem>
            {t(
              'ai:Control plane nodes: At least {{master_cpu_cores}} CPU cores, {{master_ram}} RAM, {{master_disksize}} GB disk size for every control plane node.',
              {
                master_cpu_cores: master?.cpuCores || 4,
                master_ram: masterRam,
                master_disksize: master?.diskSizeGb || 120,
              },
            )}
          </ListItem>
          <ListItem>
            {t(
              'ai:Workers: At least {{worker_cpu_cores}} CPU cores, {{worker_ram}} RAM, {{worker_disksize}} GB disk size for each worker ',
              {
                worker_cpu_cores: worker?.cpuCores || 2,
                worker_ram: workerRam,
                worker_disksize: worker?.diskSizeGb || 12,
              },
            )}
          </ListItem>
        </>
      )}

      {(isSNOCluster === true || isSNOCluster === undefined) && (
        <>
          <ListItem>
            {t(
              'ai:SNO: One host is required with at least {{sno_cpu_cores}} CPU cores, {{snoRam}} of RAM, and {{sno_disksize}} GB of disk size storage.',
              {
                sno_cpu_cores: sno?.cpuCores || 4,
                snoRam: snoRam,
                sno_disksize: sno?.diskSizeGb || 120,
              },
            )}
          </ListItem>
        </>
      )}
      <ListItem>
        {t(
          "ai:Also note that each host's disk write speed should meet the minimum requirements to run OpenShift. ",
        )}
        <ExternalLink href={HOST_REQUIREMENTS_LINK}>{t('ai:Learn more')}</ExternalLink>
      </ListItem>
    </List>
  );
};

const HostRequirements: React.FC<HostRequirementsListProps> = (props) => (
  <Content>
    <HostRequirementsList {...props} />
  </Content>
);

export default HostRequirements;
