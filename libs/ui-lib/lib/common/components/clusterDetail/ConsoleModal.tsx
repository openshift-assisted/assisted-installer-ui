import React from 'react';
import {
	Button,
	ButtonVariant,
	Content,
	ExpandableSection
} from '@patternfly/react-core';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { removeProtocolFromURL } from '../../api';
import { ToolbarButton } from '../ui/Toolbar';
import PrismCode from '../ui/PrismCode';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { selectApiVip, selectIngressVip } from '../../selectors';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

type WebConsoleHintProps = {
  cluster: Cluster;
  consoleUrl?: string;
  idPrefix?: string;
};

type LaunchOpenshiftConsoleButtonProps = WebConsoleHintProps & {
  isDisabled: boolean;
  id?: string;
};

type ConsoleModalProps = WebConsoleHintProps & {
  closeModal: () => void;
  isOpen: boolean;
};

type ModalExpandableSectionProps = {
  toggleText: string;
  className: string;
  isExpanded: boolean;
  onToggle: () => void;
  requiredList: string[];
};

const formatMultilineString = (multiLineList: string[]): string =>
  multiLineList && multiLineList.length > 0
    ? [...multiLineList.slice(1)].reduce((accu, elem) => `${accu}\n${elem}`, multiLineList[0])
    : '';

const ModalExpandableSection: React.FC<ModalExpandableSectionProps> = (props) => {
  const { requiredList, ...otherProps } = props;
  return (
    <ExpandableSection {...otherProps}>
      <PrismCode code={formatMultilineString(requiredList)} language="markup" copiable />
    </ExpandableSection>
  );
};

export const WebConsoleHint: React.FC<WebConsoleHintProps> = ({ cluster, consoleUrl }) => {
  const [isDNSExpanded, setIsDNSExpanded] = React.useState(true);
  const handleToggle = () => setIsDNSExpanded(!isDNSExpanded);
  const [apiVip, ingressVip] = [selectApiVip(cluster), selectIngressVip(cluster)];
  const clusterUrl = `${cluster.name || ''}.${cluster.baseDnsDomain || ''}`;
  const appsUrl = `apps.${clusterUrl}`;
  const etcHosts = [
    `${apiVip}\tapi.${clusterUrl}`,
    `${ingressVip}\toauth-openshift.${appsUrl}`,
    `${ingressVip}\t${removeProtocolFromURL(consoleUrl)}`,
    `${ingressVip}\tgrafana-openshift-monitoring.${appsUrl}`,
    `${ingressVip}\tthanos-querier-openshift-monitoring.${appsUrl}`,
    `${ingressVip}\tprometheus-k8s-openshift-monitoring.${appsUrl}`,
    `${ingressVip}\talertmanager-main-openshift-monitoring.${appsUrl}`,
  ];
  // Pad the lines as long as the longest record
  const paddingNum = `*.${appsUrl}.`.length + 2;
  const aRecords = [
    `api.${clusterUrl}`.padEnd(paddingNum) + `A\t${apiVip}`,
    `*.${appsUrl}`.padEnd(paddingNum) + `A\t${ingressVip}`,
  ];
  const { t } = useTranslation();
  return (
    <>
      <Content component="p">
        {t(
          'ai:In order to access the OpenShift Web Console, use external DNS server or local configuration to resolve its hostname. To do so, either:',
        )}
      </Content>
      <ModalExpandableSection
        toggleText={t('ai:Option 1: Add the following records to your DNS server (recommended)')}
        className="pf-v6-u-pb-md"
        isExpanded={isDNSExpanded}
        onToggle={handleToggle}
        requiredList={aRecords}
      />
      <ModalExpandableSection
        toggleText={t('ai:Option 2: Update your local /etc/hosts or /etc/resolv.conf files')}
        className="pf-v6-u-pb-md"
        isExpanded={!isDNSExpanded}
        onToggle={handleToggle}
        requiredList={etcHosts}
      />
    </>
  );
};

export const LaunchOpenshiftConsoleButton: React.FC<LaunchOpenshiftConsoleButtonProps> = ({
  cluster,
  consoleUrl,
  isDisabled,
  id,
}) => {
  const [isOpen, setOpen] = React.useState(false);
  const { t } = useTranslation();
  return (
    <>
      <ToolbarButton
        type="button"
        variant={ButtonVariant.primary}
        isDisabled={isDisabled}
        onClick={() => setOpen(true)}
        data-testid={id}
      >
        {t('ai:Launch OpenShift Console')}
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
  idPrefix,
}) => {
  const [isOpen, setOpen] = React.useState(false);
  const { t } = useTranslation();
  return (
    <>
      <Button
        variant="link"
        icon={<InfoCircleIcon />}
        iconPosition="left"
        isInline
        onClick={() => setOpen(true)}
        data-testid={`${idPrefix || ''}-troubleshooting-hint-open`}
      >
        {t('ai:Not able to access the Web Console?')}
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
  const { t } = useTranslation();
  const actions = [
    <Button
      type="submit"
      key="launch"
      variant={ButtonVariant.primary}
      onClick={() => window.open(consoleUrl, '_blank', 'noopener')}
      isDisabled={!consoleUrl}
    >
      {t('ai:Launch OpenShift Console')}
    </Button>,
    <Button variant={ButtonVariant.secondary} onClick={() => closeModal()} key="close">
      {t('ai:Close')}
    </Button>,
  ];
  return (
    <Modal
      title={t('ai:OpenShift Web Console troubleshooting')}
      isOpen={isOpen}
      onClose={closeModal}
      actions={actions}
      variant={ModalVariant.large}
    >
      <WebConsoleHint cluster={cluster} consoleUrl={consoleUrl} />
    </Modal>
  );
};
