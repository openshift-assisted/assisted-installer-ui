import * as React from 'react';
import {
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  Modal,
  ModalBoxBody,
  ModalBoxFooter,
  Popover,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { sortable } from '@patternfly/react-table';
import { global_palette_blue_300 as blueInfoColor } from '@patternfly/react-tokens/dist/js/global_palette_blue_300';
import { Host, ModalProgress, getHostname, getInventory } from '../../../common';
import { TableRow } from '../../../common/components/hosts/AITable';
import HostsTable from '../../../common/components/hosts/HostsTable';
import { AgentK8sResource, BareMetalHostK8sResource } from '../../types';
import { useAgentsTable } from '../Agent/tableUtils';
import { AGENT_BMH_HOSTNAME_LABEL_KEY } from '../common/constants';
import AgentStatus from '../Agent/AgentStatus';
import BMHStatus from '../Agent/BMHStatus';
import { getBMHStatus, getAgentStatus } from '../helpers';

const hostnameColumn = (agents: AgentK8sResource[]): TableRow<Host> => {
  return {
    header: {
      title: 'Hostname',
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
): TableRow<Host> => ({
  header: {
    title: 'Status',
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
              aria-label="Cluster popover"
              headerContent={<div>Cannot be deleted</div>}
              bodyContent={
                <div>
                  Hosts that are bound to a cluster cannot be deleted. Remove the host from the
                  cluster and try again.
                </div>
              }
              footerContent={
                <Link
                  to={`/multicloud/infrastructure/clusters/details/${clusterName}/`}
                >{`Go to cluster ${clusterName}`}</Link>
              }
            >
              <Button variant="link" icon={<InfoCircleIcon color={blueInfoColor.value} />}>
                Cannot be deleted
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
      sortableValue: agent ? getAgentStatus(agent)[0] : bmhStatus?.title ? bmhStatus.title : '',
    };
  },
});

const tableContent = (agents: AgentK8sResource[], bareMetalHosts: BareMetalHostK8sResource[]) => [
  hostnameColumn(agents),
  statusColumn(agents, bareMetalHosts),
];

type MassDeleteHostModalProps = {
  isOpen: boolean;
  onClose: VoidFunction;
  agents: AgentK8sResource[];
  bmhs: BareMetalHostK8sResource[];
  // eslint-disable-next-line
  onDelete: (agent?: AgentK8sResource, bmh?: BareMetalHostK8sResource) => Promise<any>;
};

const MassDeleteHostModal: React.FC<MassDeleteHostModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  agents,
  bmhs,
}) => {
  const [hosts] = useAgentsTable({ agents, bmhs });
  const [progress, setProgress] = React.useState<number | null>(null);
  const [error, setError] = React.useState<{ title: string; message: string }>();
  const onClick = async () => {
    setError(undefined);
    const i = 0;
    try {
      for (const host of hosts) {
        setProgress((100 * (i + 1)) / hosts.length);
        const agent = agents.find((a) => a.metadata?.uid === host.id);
        const bmhLabel = agent?.metadata?.labels?.[AGENT_BMH_HOSTNAME_LABEL_KEY];
        let bmh;
        if (!agent) {
          bmh = bmhs.find((bmh) => bmh.metadata?.uid === host.id);
        } else if (bmhLabel) {
          bmh = bmhs.find(
            (bmh) =>
              bmh?.metadata?.name === bmhLabel &&
              agent.metadata?.namespace === bmh.metadata?.namespace,
          );
        }
        if (!agent?.spec?.clusterDeploymentName?.name) {
          await onDelete(agent, bmh);
        }
      }
      setProgress(null);
      onClose();
    } catch (err) {
      setError({
        title: 'Failed to delete host',
        message: err?.message || 'An error occured while deleting hosts',
      });
      setProgress(null);
    }
  };

  const content = React.useMemo(() => tableContent(agents, bmhs), [agents, bmhs]);
  return (
    <Modal
      aria-label="Delete hosts dialog"
      title="Delete hosts"
      isOpen={isOpen}
      onClose={onClose}
      hasNoBodyWrapper
      id="mass-delete-modal"
      variant="medium"
      titleIconVariant="warning"
    >
      <ModalBoxBody>
        <Stack hasGutter>
          <StackItem>
            You are deleting multiple resources. All resources listed below will be deleted if you
            continue. This action cannot be undone.
          </StackItem>
          <StackItem>
            <HostsTable hosts={hosts} content={content}>
              <div>No hosts selected</div>
            </HostsTable>
          </StackItem>
          <StackItem>
            <ModalProgress error={error} progress={progress} />
          </StackItem>
        </Stack>
      </ModalBoxBody>
      <ModalBoxFooter>
        <Button onClick={onClick} isDisabled={progress !== null} variant={ButtonVariant.danger}>
          Delete hosts
        </Button>
        <Button onClick={onClose} variant={ButtonVariant.secondary} isDisabled={progress !== null}>
          Cancel
        </Button>
      </ModalBoxFooter>
    </Modal>
  );
};

export default MassDeleteHostModal;
