import * as React from 'react';
import {
	Alert,
	Button,
	ButtonVariant,
	Stack,
	StackItem
} from '@patternfly/react-core';
import {
	Modal,
	ModalBoxBody,
	ModalBoxFooter
} from '@patternfly/react-core/deprecated';
import { getAIHosts } from '../helpers';
import { AgentK8sResource } from '../../types';
import HostsTable from '../../../common/components/hosts/HostsTable';
import { TableRow } from '../../../common/components/hosts/AITable';
import { ModalProgress } from '../../../common';
import { agentStatus } from '../helpers/agentStatus';
import { usePagination } from '../../../common/components/hosts/usePagination';
import { getErrorMessage } from '../../../common/utils';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { TFunction } from 'i18next';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import { HostStatus } from '../../../common/components/hosts/types';

type ApproveTableRowProps = {
  agent?: AgentK8sResource;
};

const ApproveTableRow: React.FC<ApproveTableRowProps> = ({ agent, children }) => (
  <div className={agent?.spec.approved ? 'pf-v6-u-color-200' : undefined}>{children}</div>
);

const hostnameColumn = (agents: AgentK8sResource[], t: TFunction): TableRow<Host> => {
  return {
    header: {
      title: t('ai:Hostname'),
      props: {
        id: 'col-header-hostname', // ACM jest tests require id over testId
      },
      sort: true,
    },
    cell: (host) => {
      const agent = agents.find((a) => a.metadata?.uid === host.id);
      const hostname = agent?.spec.hostname || agent?.status?.inventory.hostname;
      return {
        title: <ApproveTableRow agent={agent}>{hostname}</ApproveTableRow>,
        props: { 'data-testid': 'hostname' },
        sortableValue: hostname,
      };
    },
  };
};

const statusColumn = (
  agents: AgentK8sResource[],
  agentStatuses: HostStatus<string>,
  t: TFunction,
): TableRow<Host> => {
  return {
    header: {
      title: t('ai:Status'),
      props: {
        id: 'col-header-status', // ACM jest tests require id over testId
      },
      sort: true,
    },
    cell: (host) => {
      const agent = agents.find((a) => a.metadata?.uid === host.id);
      const status = agent?.spec.approved
        ? t('ai:Already approved')
        : agentStatuses.discovered.title;
      const icon = agentStatuses.discovered.icon;
      return {
        title: (
          <ApproveTableRow agent={agent}>
            {agent?.spec.approved ? (
              status
            ) : (
              <>
                {icon} {status}
              </>
            )}
          </ApproveTableRow>
        ),
        props: { 'data-testid': 'status' },
        sortableValue: status,
      };
    },
  };
};

type MassApproveAgentModalProps = {
  agents: AgentK8sResource[];
  onApprove: (agent: AgentK8sResource) => Promise<AgentK8sResource>;
  isOpen: boolean;
  onClose: VoidFunction;
};

const MassApproveAgentModal: React.FC<MassApproveAgentModalProps> = ({
  agents,
  onApprove,
  isOpen,
  onClose,
}) => {
  const [progress, setProgress] = React.useState<number | null>(null);
  const [error, setError] = React.useState<{ title: string; message: string }>();
  const { t } = useTranslation();
  const agentStatuses = agentStatus(t);
  const onClick = async () => {
    setError(undefined);
    let i = 0;
    try {
      for (const agent of agents) {
        if (!agent.spec.approved) {
          setProgress((100 * (i + 1)) / agents.length);
          await onApprove(agent);
        }
        i++;
      }
      setProgress(null);
      onClose();
    } catch (err) {
      setError({
        title: t('ai:An error occured while approving agents'),
        message: getErrorMessage(err),
      });
      setProgress(null);
    }
  };
  const { content, hosts } = React.useMemo(
    () => ({
      content: [hostnameColumn(agents, t), statusColumn(agents, agentStatuses, t)],
      hosts: getAIHosts(agents),
    }),
    [agentStatuses, agents, t],
  );

  const paginationProps = usePagination(hosts.length);
  return (
    <Modal
      aria-label={t('ai:Approve hosts dialog')}
      title={t('ai:Approve hosts to join infrastructure environment')}
      isOpen={isOpen}
      onClose={onClose}
      hasNoBodyWrapper
      id="mass-approve-modal"
      variant="medium"
    >
      <ModalBoxBody>
        <Stack hasGutter>
          <StackItem>
            <Alert
              isInline
              variant="info"
              title={t(
                'ai:You are approving multiple hosts. All hosts listed below will be approved to join the infrastructure environment if you continue. Make sure that you expect and recognize the hosts before approving.',
              )}
            />
          </StackItem>
          <StackItem>
            <HostsTable hosts={hosts} content={content} {...paginationProps}>
              <div>{t('ai:No hosts selected')}</div>
            </HostsTable>
          </StackItem>
          <StackItem>
            <ModalProgress error={error} progress={progress} />
          </StackItem>
        </Stack>
      </ModalBoxBody>
      <ModalBoxFooter>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <Button onClick={onClick} isDisabled={progress !== null}>
          {t('ai:Approve all hosts')}
        </Button>
        <Button onClick={onClose} variant={ButtonVariant.secondary} isDisabled={progress !== null}>
          {t('ai:Cancel')}
        </Button>
      </ModalBoxFooter>
    </Modal>
  );
};

export default MassApproveAgentModal;
