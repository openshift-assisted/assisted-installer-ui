import * as React from 'react';
import { Button, Flex, FlexItem, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { sortable } from '@patternfly/react-table';
import { global_palette_blue_300 as blueInfoColor } from '@patternfly/react-tokens/dist/js/global_palette_blue_300';
import {
  Host,
  getHostname,
  getInventory,
  MassDeleteHostModal as CommonMassDeleteHostModal,
} from '../../../common';
import { TableRow } from '../../../common/components/hosts/AITable';
import HostsTable from '../../../common/components/hosts/HostsTable';
import {
  AgentK8sResource,
  BareMetalHostK8sResource,
  InfraEnvK8sResource,
  NMStateK8sResource,
} from '../../types';
import { useAgentsTable } from '../Agent/tableUtils';
import { AGENT_BMH_NAME_LABEL_KEY } from '../common/constants';
import AgentStatus from '../Agent/AgentStatus';
import BMHStatus from '../Agent/BMHStatus';
import { getBMHStatus, getAgentStatus } from '../helpers';
import { usePagination } from '../../../common/components/hosts/usePagination';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { TFunction } from 'i18next';

const hostnameColumn = (agents: AgentK8sResource[], t: TFunction): TableRow<Host> => {
  return {
    header: {
      title: t('ai:Hostname'),
      props: {
        id: 'col-header-hostname', // ACM jest tests require id over testId
      },
      transforms: [sortable],
    },
    cell: (host) => {
      const inventory = getInventory(host);
      const computedHostname = getHostname(host, inventory);
      const assignedToCluster = agents.find((a) => a.metadata?.uid === host.id)?.spec
        ?.clusterDeploymentName?.name;
      return {
        title: (
          <div className={assignedToCluster ? 'pf-u-color-200' : undefined}>{computedHostname}</div>
        ),
        props: { 'data-testid': 'hostname' },
        sortableValue: computedHostname,
      };
    },
  };
};

const statusColumn = (
  agents: AgentK8sResource[],
  bmhs: BareMetalHostK8sResource[],
  t: TFunction,
): TableRow<Host> => ({
  header: {
    title: t('ai:Status'),
    props: {
      id: 'col-header-status',
    },
    transforms: [sortable],
  },
  cell: (host) => {
    const agent = agents.find((a) => a.metadata?.uid === host.id);
    const clusterName = agent?.spec.clusterDeploymentName?.name;
    const bmh = bmhs?.find((b) => b.metadata?.uid === host.id);

    let bmhStatus;
    let title: React.ReactNode = '--';
    if (agent) {
      title = clusterName ? (
        <Flex>
          <FlexItem>
            <AgentStatus agent={agent} zIndex={7000} />
          </FlexItem>
          <FlexItem align={{ default: 'alignRight' }}>
            <Popover
              aria-label={t('ai:Cluster popover')}
              headerContent={<div>{t('ai:Cannot be deleted')}</div>}
              bodyContent={
                <div>
                  {t(
                    'ai:Hosts that are bound to a cluster cannot be deleted. Remove the host from the cluster and try again.',
                  )}
                </div>
              }
              footerContent={
                <Link to={`/multicloud/infrastructure/clusters/details/${clusterName}/`}>
                  {t('ai:Go to cluster {{clusterName}}', { clusterName })}
                </Link>
              }
            >
              <Button variant="link" icon={<InfoCircleIcon color={blueInfoColor.value} />}>
                {t('ai:Cannot be deleted')}
              </Button>
            </Popover>
          </FlexItem>
        </Flex>
      ) : (
        <AgentStatus agent={agent} />
      );
    } else if (bmh) {
      bmhStatus = getBMHStatus(bmh);
      title = <BMHStatus bmhStatus={bmhStatus} />;
    }

    return {
      title,
      props: { 'data-testid': 'host-status' },
      sortableValue: agent ? getAgentStatus(agent).status.title : bmhStatus?.state.title || '',
    };
  },
});

const tableContent = (
  agents: AgentK8sResource[],
  bareMetalHosts: BareMetalHostK8sResource[],
  t: TFunction,
) => [hostnameColumn(agents, t), statusColumn(agents, bareMetalHosts, t)];

type MassDeleteAgentModalProps = {
  isOpen: boolean;
  onClose: VoidFunction;
  agents: AgentK8sResource[];
  bmhs: BareMetalHostK8sResource[];
  nmStates: NMStateK8sResource[];
  // eslint-disable-next-line
  onDelete: (
    agent?: AgentK8sResource,
    bmh?: BareMetalHostK8sResource,
    nmStates?: NMStateK8sResource[],
  ) => Promise<unknown>;
  infraEnv: InfraEnvK8sResource;
};

const MassDeleteAgentModal: React.FC<MassDeleteAgentModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  agents,
  bmhs,
  infraEnv,
  nmStates,
}) => {
  const [hosts] = useAgentsTable({ agents, bmhs, infraEnv });
  const onClick = async (host: Host) => {
    const agent = agents.find((a) => a.metadata?.uid === host.id);
    const bmhLabel = agent?.metadata?.labels?.[AGENT_BMH_NAME_LABEL_KEY];
    let bmh;
    if (!agent) {
      bmh = bmhs.find((bmh) => bmh.metadata?.uid === host.id);
    } else if (bmhLabel) {
      bmh = bmhs.find(
        (bmh) =>
          bmh?.metadata?.name === bmhLabel && agent.metadata?.namespace === bmh.metadata?.namespace,
      );
    }
    if (!agent?.spec?.clusterDeploymentName?.name) {
      return onDelete(agent, bmh, nmStates);
    }
  };
  const { t } = useTranslation();
  const content = React.useMemo(() => tableContent(agents, bmhs, t), [agents, bmhs, t]);
  const paginationProps = usePagination(hosts.length);

  return (
    <CommonMassDeleteHostModal hosts={hosts} isOpen={isOpen} onClose={onClose} onDelete={onClick}>
      <HostsTable hosts={hosts} content={content} {...paginationProps}>
        <div>{t('ai:No hosts selected')}</div>
      </HostsTable>
    </CommonMassDeleteHostModal>
  );
};
export default MassDeleteAgentModal;
