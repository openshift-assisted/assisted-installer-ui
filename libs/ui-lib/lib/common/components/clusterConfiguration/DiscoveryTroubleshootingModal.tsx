import React from 'react';
import {
	Button,
	ButtonVariant,
	Content,
	ContentVariants,
	List,
	ListComponent,
	ListItem,
	OrderType,
	HelperText,
	HelperTextItem
} from '@patternfly/react-core';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { PrismCode, SimpleAIPrismTheme, UiIcon } from '../ui';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { Trans } from 'react-i18next';
import { saveAs } from 'file-saver';
import { CHANGE_ISO_PASSWORD_FILE_LINK } from '../../config/docs_links';
import * as Sentry from '@sentry/browser';

export const DiscoveryTroubleshootingModalContent = () => {
  const { t } = useTranslation();

  const downloadIsoPasswordScript = async () => {
    try {
      const response = await fetch(CHANGE_ISO_PASSWORD_FILE_LINK);
      const fileContent = await response.text();
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, 'change-iso-password.sh');
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return (
    <List component={ListComponent.ol} type={OrderType.number}>
      <ListItem>
        <Content component={ContentVariants.p}>{t('ai:The host machine is powered on')}</Content>
        <HelperText>
          <HelperTextItem variant="indeterminate">
            {t(
              'ai:Boot time depends on several factors such as your hardware and network configuration, and if you are booting from an ISO.',
            )}
          </HelperTextItem>
        </HelperText>
      </ListItem>
      <ListItem>
        <Content component={ContentVariants.p}>
          {t('ai:If you used DHCP networking, verify that your DHCP server is enabled')}
        </Content>
      </ListItem>
      <ListItem>
        <Content component={ContentVariants.p}>
          {t(
            'ai:If you used static IP, bridges, and bonds networking, verify that your configurations are correct',
          )}
        </Content>
      </ListItem>
      <ListItem>
        <Content component={ContentVariants.p}>{t('ai:SSH into your machine')}</Content>
        <HelperText>
          <HelperTextItem variant="indeterminate">
            {t(
              'ai:Verify that you can access your host machine using SSH, or a console such as BMC or virtual machine console. In the CLI, enter the following command:',
            )}
          </HelperTextItem>
        </HelperText>
        <PrismCode theme={SimpleAIPrismTheme} code="ssh -i <identity_file> core@<machine-ip>" />
        <HelperText>
          <HelperTextItem variant="indeterminate">
            {t(
              'ai:Authentication is provided by the discovery ISO, therefore when you access your host using SSH, a password is not required. Optional -i parameter can be used to specify the private key that matches the public key provided when generating Discovery ISO.',
            )}
          </HelperTextItem>
        </HelperText>
      </ListItem>
      <ListItem>
        <Content component={ContentVariants.p}>
          {t('ai:Unable to SSH into your hosts through the network?')}
        </Content>
        <HelperText>
          <HelperTextItem variant="indeterminate">
            {t(
              'ai:Try logging into the machine directly through physical access, out-of-band management, or a virtual machine console. To generate a new bootable image file with password-based login enabled, download the full image file and patch it locally with a login password of your choice using',
            )}{' '}
            <Button
              variant={ButtonVariant.link}
              onClick={() => {
                void downloadIsoPasswordScript();
              }}
              data-testid="download-script-btn"
              isInline
            >
              {t('ai:this script.')}
            </Button>
          </HelperTextItem>
        </HelperText>
        <HelperText>
          <HelperTextItem variant="indeterminate">
            {t('ai:Run these commands to use the script:')}
          </HelperTextItem>
        </HelperText>
        <PrismCode
          theme={SimpleAIPrismTheme}
          code={`chmod +x ./change-iso-password.sh
./change-iso-password.sh <path_to_your_iso_file>`}
        />
      </ListItem>
      <ListItem>
        <Content component={ContentVariants.p}>
          {t('ai:The discovery agent is running with the correct parameters')}
        </Content>
        <PrismCode theme={SimpleAIPrismTheme} code={`ps -ef | grep agent`} />
        <HelperText>
          <HelperTextItem variant="indeterminate">
            {t('ai:The output displays the following:')}
          </HelperTextItem>
        </HelperText>
        <PrismCode
          theme={SimpleAIPrismTheme}
          code={`root        1786       1  0 08:03 ?        00:00:00 /usr/local/bin/agent --url https://api.openshift.com --cluster-id e4c85fbe-77c7-411e-b107-5120f615c4fb --agent-version registry.redhat.io/openshift4/assisted-installer-agent-rhel8:v4.6.0-17 --insecure=false
core        2362    2311  0 08:04 pts/0    00:00:00 grep --color=auto agent`}
        />
      </ListItem>
      <ListItem>
        <Content component={ContentVariants.p}>{t('ai:The agent ran successfully')}</Content>
        <HelperText>
          <HelperTextItem variant="indeterminate">
            {t('ai:To verify that the agent ran successfully, check the logs:')}
          </HelperTextItem>
        </HelperText>
        <PrismCode theme={SimpleAIPrismTheme} code="sudo journalctl -u agent.service" />
        <HelperText>
          <HelperTextItem variant="indeterminate">
            {t('ai:In the following example, the errors indicate there is a network issue:')}
          </HelperTextItem>
        </HelperText>
        <PrismCode
          theme={{ ...SimpleAIPrismTheme, styles: [] }}
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
        <HelperText>
          <HelperTextItem variant="indeterminate">
            <Trans
              t={t}
              components={{ code: <code /> }}
              i18nKey="ai:Check the proxy settings and verify that the assisted installer service is connected to a network. You can use <code>nmcli</code> to get additional information about your network configuration."
            />
          </HelperTextItem>
        </HelperText>
      </ListItem>
      <ListItem>
        <Content component={ContentVariants.p}>{t('ai:Check agent logs')}</Content>
        <HelperText>
          <HelperTextItem variant="indeterminate">
            {t('ai:To view detailed agent logs and communication use following command:')}
          </HelperTextItem>
        </HelperText>
        <PrismCode theme={SimpleAIPrismTheme} code="sudo journalctl TAG=agent | less" />
      </ListItem>
      <ListItem>
        <Content component={ContentVariants.p}>{t('ai:Check assisted-installer logs')}</Content>
        <PrismCode
          theme={SimpleAIPrismTheme}
          code={`sudo su
podman ps -a | grep assisted-installer
podman logs <container id>`}
        />
      </ListItem>
      <ListItem>
        <Content component={ContentVariants.p}>{t('ai:Check bootkube logs')}</Content>
        <PrismCode theme={SimpleAIPrismTheme} code={`sudo journalctl -u bootkube`} />
      </ListItem>
    </List>
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
          <UiIcon size="sm" icon={<InfoCircleIcon />} />
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
      title={t('ai:Hosts not showing up troubleshooter')}
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
