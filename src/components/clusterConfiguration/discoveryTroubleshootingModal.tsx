import React from 'react';
import {
  Button,
  Modal,
  ButtonVariant,
  ModalVariant,
  TextContent,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import { ToolbarButton } from '../ui/Toolbar';
import PrismCode from '../ui/PrismCode';

type DiscoveryTroubleshootingModalButtonProps = React.ComponentProps<typeof Button> & {
  ButtonComponent?: typeof Button | typeof ToolbarButton;
  onClick?: () => void;
};

export const DiscoveryTroubleshootingModalButton: React.FC<DiscoveryTroubleshootingModalButtonProps> = ({
  ButtonComponent = Button,
  onClick,
  children,
  ...props
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const closeModal = () => setIsModalOpen(false);
  const handleClick = onClick || (() => setIsModalOpen(true));
  return (
    <>
      <ButtonComponent variant={ButtonVariant.link} {...props} onClick={handleClick} isInline>
        {children}
      </ButtonComponent>
      <DiscoveryTroubleshootingModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

type DiscoveryTroubleshootingModalProps = {
  onClose: () => void;
  isOpen: boolean;
};

export const DiscoveryTroubleshootingModal: React.FC<DiscoveryTroubleshootingModalProps> = ({
  onClose,
  isOpen,
}) => {
  return (
    <Modal
      title="Host Discovery Troubleshooting"
      isOpen={isOpen}
      actions={[
        <Button key="close" variant={ButtonVariant.primary} onClick={onClose}>
          Close
        </Button>,
      ]}
      onClose={onClose}
      variant={ModalVariant.large}
    >
      <TextContent>
        <Text component={TextVariants.p}>
          Booting up an ISO might take a few minutes, and might depend heavily on your hardware and
          network configuration, however, if you have verified that your host is on, DHCP is enabled
          and yet the host does not appear in the UI, you may try to login over SSH to the host in
          order to troubleshoot, for that you would need to know your machine IP-address, or use a
          console such as BMC, virtual machine console etc.
        </Text>
        <Text component={TextVariants.h2}>SSH into your machine</Text>
        <PrismCode code={`ssh core@<machine-ip>`} />
        <Text component={TextVariants.p}>
          The SSH key provided when generating the discovery ISO is used to authenticate the user.
          It should not be required to provide the password.
        </Text>
        <Text component={TextVariants.h2}>
          Verify that the discovery agent is running correctly
        </Text>
        <Text component={TextVariants.p}>Execute</Text>
        <PrismCode code={`ps -ef | grep agent`} />
        <Text component={TextVariants.p}>
          and see whether the agent runs with correct parameters. The result should look similar to
          this:
        </Text>
        <PrismCode
          code={`root        1342       1  0 09:56 ?        00:00:00 /usr/local/bin/agent --host 192.168.39.162 --port 30956 --cluster-id a8142e14-8bfe-46bd-bfbd-4bd1a126892b core        2063    2003  0 10:41 pts/0    00:00:00 grep --color=auto agent`}
        />
        <Text component={TextVariants.p}>
          See that logs are indicating that agent was run successfully:
        </Text>
        <PrismCode
          code={`[core@vm-11-47 ~]$ sudo journalctl -u agent
-- Logs begin at Mon 2020-05-25 14:02:10 UTC, end at Mon 2020-05-25 19:50:52 UTC. --
May 25 14:02:25 localhost systemd[1]: Starting agent.service...
May 25 14:02:31 vm-11-47 docker[957]: Unable to find image locally
May 25 14:02:33 vm-11-47 docker[957]: latest: Pulling from agent
May 25 14:02:33 vm-11-47 docker[957]: 5d20c808ce19: Pulling fs layer
May 25 14:02:33 vm-11-47 docker[957]: 1b657f4d2d40: Pulling fs layer
May 25 14:02:33 vm-11-47 docker[957]: 8843662234e1: Pulling fs layer
May 25 14:02:35 vm-11-47 docker[957]: 5d20c808ce19: Download complete
May 25 14:02:35 vm-11-47 docker[957]: 5d20c808ce19: Pull complete
May 25 14:02:43 vm-11-47 docker[957]: 8843662234e1: Verifying Checksum
May 25 14:02:43 vm-11-47 docker[957]: 8843662234e1: Download complete
May 25 14:03:32 vm-11-47 docker[957]: 1b657f4d2d40: Download complete
May 25 14:03:33 vm-11-47 docker[957]: 1b657f4d2d40: Pull complete
May 25 14:03:34 vm-11-47 docker[957]: 8843662234e1: Pull complete
May 25 14:03:34 vm-11-47 docker[957]: Digest: sha256:a6024573526db8ddff7ba796df29b61e09ca5ca0f1c47356088c2203d5872d16
May 25 14:03:34 vm-11-47 docker[957]: Status: Downloaded newer image
May 25 14:03:34 vm-11-47 systemd[1]: Started agent.service.`}
        />
        <Text component={TextVariants.p}>If you see something like this:</Text>
        <PrismCode
          code={`May 17 14:01:14 localhost systemd[1]: Starting agent.service...
May 17 14:01:18 localhost docker[1013]: Unable to find image locally
May 17 14:01:33 localhost docker[1013]: /usr/bin/docker: Error response from daemon: Get https://quay.io/v2/: net/http: request canceled while waiting for connection (Client.Timeout exceeded while awaiting headers).
May 17 14:01:33 localhost docker[1013]: See '/usr/bin/docker run --help'.
May 17 14:01:33 localhost systemd[1]: agent.service: Control process exited, code=exited, status=125/n/a
May 17 14:01:33 localhost systemd[1]: agent.service: Failed with result 'exit-code'.
May 17 14:01:33 localhost systemd[1]: Failed to start agent.service.`}
        />
        <Text component={TextVariants.p}>
          That implies you have a networking issue, perhaps a wrong proxy or no connection to the
          assisted installation service.You can use the nmcli to get additional information about
          your network configuration.
        </Text>
        <Text component={TextVariants.h2}>Check agent logs</Text>
        <PrismCode code={`[core@vm-11-47 ~]$ less /var/log/agent.log`} />
        <Text component={TextVariants.h2}>Check assisted-installer logs</Text>
        <PrismCode
          code={`[core@vm-11-47 ~]$ sudo su
[core@vm-11-47 ~]$ podman ps -a | grep assisted-installer
[core@vm-11-47 ~]$ podman logs <container id>`}
        />
        <Text component={TextVariants.h2}>Check bootkube logs</Text>
        <PrismCode code={`[core@vm-11-47 ~]$ journalctl -u bootkube`} />
      </TextContent>
    </Modal>
  );
};
