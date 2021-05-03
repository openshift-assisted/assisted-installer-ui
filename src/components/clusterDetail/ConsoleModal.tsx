import React from 'react';
import {
  Modal,
  Button,
  ButtonVariant,
  Text,
  ModalVariant,
  ExpandableSection,
} from '@patternfly/react-core';
import { Cluster, Host, Interface, Inventory } from '../../api/types';
import { removeProtocolFromURL, stringToJSON } from '../../api/utils';
import { ToolbarButton } from '../ui/Toolbar';
import { InfoCircleIcon } from '@patternfly/react-icons';
import PrismCode from '../ui/PrismCode';
import { findHostById, unmarshallInventory } from '../hosts/utils';
import isCIDR from 'is-cidr';
import { Address4, Address6 } from 'ip-address';
import { isSingleNodeCluster } from '../clusters/utils';

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
  optionalList: string[];
};

const formatMultilineString = (multiLineList: string[]): string =>
  multiLineList && multiLineList.length > 0
    ? [...multiLineList.slice(1)].reduce((accu, elem) => `${accu}\n${elem}`, multiLineList[0])
    : '';

const ModalExpandableSection: React.FC<ModalExpandableSectionProps> = (props) => {
  const { requiredList, optionalList, ...otherProps } = props;

  return (
    <ExpandableSection {...otherProps}>
      <PrismCode code={formatMultilineString(requiredList)} language="markup" />
      <br />
      <Text component="h6">Optional:</Text>
      <PrismCode code={formatMultilineString(optionalList)} language="markup" />
    </ExpandableSection>
  );
};

const getHostIPs = (cluster: Cluster): { [key: string]: string } => {
  const hostIPAddresses = {};

  cluster.hosts?.map((host: Host) => {
    if (host && host.requestedHostname) {
      const interfaces: Interface[] | undefined =
        stringToJSON<Inventory>(host.inventory)?.interfaces || undefined;
      if (
        interfaces &&
        interfaces.length > 0 &&
        interfaces[0].ipv4Addresses &&
        interfaces[0].ipv4Addresses.length > 0
      ) {
        hostIPAddresses[host.requestedHostname] = interfaces[0].ipv4Addresses[0].split('/')[0];
      }
    }
  });

  return hostIPAddresses;
};

const getVirtualIPs = ({
  apiVip,
  ingressVip,
  machineNetworkCidr = '',
  hosts = [],
  hostNetworks = [],
}: Cluster) => {
  const vipValues = { apiVip, ingressVip };
  // We assume at this point the server will
  // populate this value with either an IPv4 or IPv6 address
  const isIPv4 = isCIDR.v4(machineNetworkCidr);
  const network = isIPv4 ? new Address4(machineNetworkCidr) : new Address6(machineNetworkCidr);
  const hostIds =
    hostNetworks?.find((hostNetwork) => hostNetwork.cidr === machineNetworkCidr)?.hostIds || [];
  // According to BE team, if it's a SNO cluster, there should be only one host in the cluster
  // network with status 'installed'
  const host = hostIds
    ?.map((hostId) => findHostById(hosts, hostId))
    ?.find((host) => host?.status === 'installed');
  const inventory = unmarshallInventory(host?.inventory);
  let ipAddresses;
  if (isIPv4) {
    ipAddresses = inventory?.interfaces?.reduce(
      (list, adapter) => list.concat(adapter.ipv4Addresses || []),
      [] as Required<Interface>['ipv4Addresses'],
    );
  } else {
    ipAddresses = inventory?.interfaces?.reduce(
      (list, adapter) => list.concat(adapter.ipv6Addresses || []),
      [] as Required<Interface>['ipv6Addresses'],
    );
  }

  const hostIP = ipAddresses
    ?.filter(Boolean)
    .find((ip) => {
      const address = isIPv4 ? new Address4(ip) : new Address6(ip);
      return address.isInSubnet(network);
    })
    ?.split('/')[0];

  // override the VIPs
  vipValues.apiVip = hostIP;
  vipValues.ingressVip = hostIP;

  return vipValues;
};

export const WebConsoleHint: React.FC<WebConsoleHintProps> = ({ cluster, consoleUrl }) => {
  const [isDNSExpanded, setIsDNSExpanded] = React.useState(true);
  const handleToggle = () => setIsDNSExpanded(!isDNSExpanded);

  // TODO(jkilzi):
  //  This logic should be provided by the BE!!! once implemented
  //  just remove this line (and `getVirtualIPs`) and just read the
  //  VIP values from the cluster object
  const virtualIPs = React.useMemo(() => {
    const { apiVip, ingressVip } = cluster;
    let vips = { apiVip, ingressVip };
    try {
      if (isSingleNodeCluster(cluster)) {
        vips = getVirtualIPs(cluster);
      }
    } catch (error) {
      console.warn(`Error at getVirtualIPs:\n${error}`);
    }

    return vips;
  }, [cluster]);

  const hostIPs = React.useMemo(() => getHostIPs(cluster), [cluster]);
  const sortedHostIPs = Object.keys(hostIPs).sort();
  const etcHostsOptional = sortedHostIPs.map(
    (hostname: string) => `${hostIPs[hostname]}\t${hostname}`,
  );

  const clusterUrl = `${cluster.name}.${cluster.baseDnsDomain}`;
  const appsUrl = `apps.${clusterUrl}`;
  const etcHosts = [
    `${virtualIPs.apiVip}\tapi.${clusterUrl}`,
    `${virtualIPs.ingressVip}\toauth-openshift.${appsUrl}`,
    `${virtualIPs.ingressVip}\t${removeProtocolFromURL(consoleUrl)}`,
    `${virtualIPs.ingressVip}\tgrafana-openshift-monitoring.${appsUrl}`,
    `${virtualIPs.ingressVip}\tthanos-querier-openshift-monitoring.${appsUrl}`,
    `${virtualIPs.ingressVip}\tprometheus-k8s-openshift-monitoring.${appsUrl}`,
    `${virtualIPs.ingressVip}\talertmanager-main-openshift-monitoring.${appsUrl}`,
  ];

  // Pad the lines as long as the longest record
  const paddingNum = `*.${appsUrl}.`.length + 2;

  const aRecords = [
    `api.${clusterUrl}`.padEnd(paddingNum) + `A\t${virtualIPs.apiVip}`,
    `*.${appsUrl}`.padEnd(paddingNum) + `A\t${virtualIPs.ingressVip}`,
  ];

  const aRecordsOptional = sortedHostIPs.map((hostname: string) => {
    const fqdn = cluster.baseDnsDomain ? `${hostname}.${cluster.baseDnsDomain}` : hostname;
    return `${fqdn}\tA\t${hostIPs[hostname]}`;
  });

  return (
    <>
      <Text component="p">
        In order to access the OpenShift Web Console, use external DNS server or local configuration
        to resolve its hostname. To do so, either:
      </Text>
      <ModalExpandableSection
        toggleText="Option 1: Add the following records to your DNS server (recommended)"
        className="pf-u-pb-md"
        isExpanded={isDNSExpanded}
        onToggle={handleToggle}
        requiredList={aRecords}
        optionalList={aRecordsOptional}
      />
      <ModalExpandableSection
        toggleText="Option 2: Update your local /etc/hosts or /etc/resolve.conf files"
        className="pf-u-pb-md"
        isExpanded={!isDNSExpanded}
        onToggle={handleToggle}
        requiredList={etcHosts}
        optionalList={etcHostsOptional}
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

  return (
    <>
      <ToolbarButton
        type="button"
        variant={ButtonVariant.primary}
        isDisabled={isDisabled}
        onClick={() => setOpen(true)}
        data-testid={id}
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
  idPrefix,
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
        data-testid={`${idPrefix}-troubleshooting-hint-open`}
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
    <Button variant={ButtonVariant.secondary} onClick={() => closeModal()} key="close">
      Close
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
