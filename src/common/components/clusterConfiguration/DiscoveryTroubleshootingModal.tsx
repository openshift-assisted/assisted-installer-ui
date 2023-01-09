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
import { InfoCircleIcon } from '@patternfly/react-icons';
import { PrismCode } from '../ui';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { Trans } from 'react-i18next';

export const DiscoveryTroubleshootingModalContent = () => {
  const { t } = useTranslation();
  return (
    <TextContent>
      <Text component={TextVariants.p}>
        {t('ai:To troubleshoot host discovery issues, complete the following steps:')}
      </Text>
      <Text component={TextVariants.h2}>{t('ai:Verify that your host machine is powered on')}</Text>
      <Text component={TextVariants.p}>
        {t(
          'ai:Note: Boot time depends on several factors such as your hardware and network configuration, and if you are booting from an ISO.',
        )}
      </Text>
      <Text component={TextVariants.h2}>
        {t('ai:If you used DHCP networking, verify that your DHCP server is enabled')}
      </Text>
      <Text component={TextVariants.h2}>
        {t(
          'ai:If you used static IP, bridges, and bonds networking, verify that your configurations are correct',
        )}
      </Text>
      <Text component={TextVariants.h2}>{t('ai:SSH into your machine')}</Text>
      <Text component={TextVariants.p}>
        {t(
          'ai:Verify that you can access your host machine using SSH, or a console such as BMC or virtual machine console. In the CLI, enter the following command:',
        )}
      </Text>
      <PrismCode code="ssh -i <identity_file> core@<machine-ip>" />
      <Text component={TextVariants.p}>
        {t(
          'ai:NOTE: Authentication is provided by the discovery ISO, therefore when you access your host using SSH, a password is not required. Optional -i parameter can be used to specify the private key that matches the public key provided when generating Discovery ISO.',
        )}
      </Text>
      <Text component={TextVariants.h2}>
        {t('ai:Verify that the discovery agent is running with the correct parameters')}
      </Text>
      <PrismCode code={`ps -ef | grep agent`} />
      <Text component={TextVariants.p}>{t('ai:The output displays the following:')}</Text>
      <PrismCode
        code={`root        1786       1  0 08:03 ?        00:00:00 /usr/local/bin/agent --url https://api.openshift.com --cluster-id e4c85fbe-77c7-411e-b107-5120f615c4fb --agent-version registry.redhat.io/openshift4/assisted-installer-agent-rhel8:v4.6.0-17 --insecure=false
core        2362    2311  0 08:04 pts/0    00:00:00 grep --color=auto agent`}
      />
      <Text component={TextVariants.h2}>{t('ai:Verify that the agent ran successfully')}</Text>
      <Text component={TextVariants.p}>
        {t('ai:To verify that the agent ran successfully, check the logs:')}
      </Text>
      <PrismCode code="sudo journalctl -u agent.service" />
      <Text component={TextVariants.p}>
        {t('ai:In the following example, the errors indicate there is a network issue:')}
      </Text>
      <PrismCode
        code={`Oct 15 11:26:35 localhost systemd[1]: agent.service: Service RestartSec=3s expired, scheduling restart.
Oct 15 11:26:35 localhost systemd[1]: agent.service: Scheduled restart job, restart counter is at 9.
Oct 15 11:26:35 localhost systemd[1]: Stopped agent.service.
Oct 15 11:26:35 localhost systemd[1]: Starting agent.service...
Oct 15 11:26:35 localhost podman[1834]: Trying to pull quay.io/ocpmetal/assisted-installer-agent:latest...
Oct 15 11:26:35 localhost podman[1834]:   Get "https://quay.io/v2/": dial tcp: lookup quay.io on [::1]:53: read udp [::1]:58297->[::1]:53: read: connection refused
Oct 15 11:26:35 localhost podman[1834]: Error: unable to pull quay.io/ocpmetal/assisted-installer-agent:latest: unable to pull image: Error initializing source docker://quay.io/ocpmetal/assisted-installer-agent:latest: error pinging dock>
Oct 15 11:26:35 localhost systemd[1]: agent.service: Control process exited, code=exited status=125
Oct 15 11:26:35 localhost systemd[1]: agent.service: Failed with result 'exit-code'.
Oct 15 11:26:35 localhost systemd[1]: Failed to start agent.service.`}
      />
      <Text component={TextVariants.p}>
        <Trans
          t={t}
          components={{ code: <code /> }}
          i18nKey="ai:Check the proxy settings and verify that the assisted installer service is connected to a network. You can use <code>nmcli</code> to get additional information about your network configuration."
        />
      </Text>
      <Text component={TextVariants.h2}>{t('ai:Check agent logs')}</Text>
      <Text component={TextVariants.p}>
        {t('ai:To view detailed agent logs and communication use following command:')}
      </Text>
      <PrismCode code="sudo journalctl TAG=agent | less" />
      <Text component={TextVariants.h2}>{t('ai:Check assisted-installer logs')}</Text>
      <PrismCode
        code={`sudo su
podman ps -a | grep assisted-installer
podman logs <container id>`}
      />
      <Text component={TextVariants.h2}>{t('ai:Check bootkube logs')}</Text>
      <PrismCode code={`sudo journalctl -u bootkube`} />
    </TextContent>
  );
};

export type HostsNotShowingLinkProps = {
  setDiscoveryHintModalOpen: (isOpen: boolean) => void;
  isSNO?: boolean;
  isInline?: boolean;
};

type DiscoveryTroubleshootingModalProps = {
  setDiscoveryHintModalOpen: (isOpen: boolean) => void;
  isOpen: boolean;
};

export const HostsNotShowingLink = ({
  setDiscoveryHintModalOpen,
  isSNO = false,
  isInline = false,
}: HostsNotShowingLinkProps) => {
  const { t } = useTranslation();
  return (
    <Button variant={ButtonVariant.link} onClick={() => setDiscoveryHintModalOpen(true)} isInline>
      {!isInline && (
        <>
          <InfoCircleIcon size="sm" />
          &nbsp;
        </>
      )}
      {t('ai:Host not showing up?', { count: +isSNO })}
    </Button>
  );
};

export const DiscoveryTroubleshootingModal = ({
  setDiscoveryHintModalOpen,
  isOpen,
}: DiscoveryTroubleshootingModalProps) => {
  const onClose = React.useCallback(
    () => setDiscoveryHintModalOpen(false),
    [setDiscoveryHintModalOpen],
  );

  const { t } = useTranslation();
  return (
    <Modal
      title={t('ai:Troubleshooting Host Discovery Issues')}
      isOpen={isOpen}
      actions={[
        <Button key="close" variant={ButtonVariant.primary} onClick={onClose}>
          {t('ai:Close')}
        </Button>,
      ]}
      onClose={onClose}
      variant={ModalVariant.large}
    >
      <DiscoveryTroubleshootingModalContent />
    </Modal>
  );
};
