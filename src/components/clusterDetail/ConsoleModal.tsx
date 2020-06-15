import React from 'react';
import {
  Modal,
  Button,
  ButtonVariant,
  TextContent,
  Text,
  TextList,
  TextListItem,
  ModalVariant,
} from '@patternfly/react-core';
import { Cluster } from '../../api/types';
import { removeProtocolFromURL } from '../../api/utils';
import { ToolbarButton } from '../ui/Toolbar';
import { InfoCircleIcon } from '@patternfly/react-icons';

type WebConsoleHintProps = {
  cluster: Cluster;
  consoleUrl?: string;
};

type LaunchOpenshiftConsoleButtonProps = WebConsoleHintProps & {
  isDisabled: boolean;
};

type ConsoleModalProps = WebConsoleHintProps & {
  closeModal: () => void;
  isOpen: boolean;
};

export const WebConsoleHint: React.FC<WebConsoleHintProps> = ({ cluster, consoleUrl }) => {
  const clusterUrl = `${cluster.name}.${cluster.baseDnsDomain}`;
  const appsUrl = `apps.${clusterUrl}`;
  const etcHosts = [
    `${cluster.ingressVip}\t${removeProtocolFromURL(consoleUrl)}`,
    `${cluster.ingressVip}\toauth-openshift.${appsUrl}`,
    `${cluster.ingressVip}\tgrafana-openshift-monitoring.${appsUrl}`,
    `${cluster.ingressVip}\tprometheus-k8s-openshift-monitoring.${appsUrl}`,
    `${cluster.ingressVip}\tthanos-querier-openshift-monitoring.${appsUrl}`,
    `${cluster.ingressVip}\talertmanager-main-openshift-monitoring.${appsUrl}`,
    `${cluster.apiVip}\tapi.${clusterUrl}`,
  ];

  return (
    <TextContent>
      <Text component="p">
        In order to access the OpenShift Web Console, make sure your local or external DNS server is
        configured to resolve its hostname. To do so, either:
      </Text>
      <TextList>
        <TextListItem>
          Update your local /etc/hosts or /etc/resolve.conf files to resolve:
          <Text component="p">
            {etcHosts.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </Text>
        </TextListItem>
        <TextListItem>
          Contact your network administrator to configure this resolution in an external DNS server.
        </TextListItem>
      </TextList>
    </TextContent>
  );
};

export const LaunchOpenshiftConsoleButton: React.FC<LaunchOpenshiftConsoleButtonProps> = ({
  cluster,
  consoleUrl,
  isDisabled,
}) => {
  const [isOpen, setOpen] = React.useState(false);

  return (
    <>
      <ToolbarButton
        type="button"
        variant={ButtonVariant.primary}
        isDisabled={isDisabled}
        onClick={() => setOpen(true)}
      >
        Launch OpenShift Console
      </ToolbarButton>
      <ConsoleModal
        closeModal={() => setOpen(false)}
        consoleUrl={consoleUrl}
        cluster={cluster}
        isOpen={isOpen}
      />
    </>
  );
};

export const TroubleshootingOpenshiftConsoleButton: React.FC<WebConsoleHintProps> = ({
  cluster,
  consoleUrl,
}) => {
  const [isOpen, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="link"
        icon={<InfoCircleIcon />}
        iconPosition="left"
        isInline
        onClick={() => setOpen(true)}
      >
        Not able to access the Web Console?
      </Button>
      <ConsoleModal
        closeModal={() => setOpen(false)}
        consoleUrl={consoleUrl}
        cluster={cluster}
        isOpen={isOpen}
      />
    </>
  );
};

export const ConsoleModal: React.FC<ConsoleModalProps> = ({
  closeModal,
  cluster,
  consoleUrl,
  isOpen,
}) => {
  const actions = [
    <Button
      type="submit"
      key="launch"
      variant={ButtonVariant.primary}
      onClick={() => window.open(consoleUrl, '_blank', 'noopener')}
      isDisabled={!consoleUrl}
    >
      Launch OpenShift Console
    </Button>,
    <Button variant={ButtonVariant.secondary} onClick={() => closeModal()} key="cancel">
      Cancel
    </Button>,
  ];

  return (
    <Modal
      title="OpenShift Web Console troubleshooting"
      isOpen={isOpen}
      onClose={closeModal}
      actions={actions}
      variant={ModalVariant.large}
    >
      <WebConsoleHint cluster={cluster} consoleUrl={consoleUrl} />
    </Modal>
  );
};
