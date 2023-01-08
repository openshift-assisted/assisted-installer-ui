import { HostStaticNetworkConfig } from '../../../../../common';

import {
  FormViewHost,
  FormViewNetworkWideValues,
  ProtocolVersion,
  StaticFormData,
  StaticProtocolType,
} from './dataTypes';
import findLastIndex from 'lodash/findLastIndex';
import {
  getProtocolVersionIdx,
  YAML_COMMENT_CHAR,
  getMachineNetworks,
  getProtocolType,
  yamlToNmstateObject,
} from './nmstateYaml';

import { getShownProtocolVersions } from './protocolVersion';
import { getEmptyNetworkWideConfigurations } from './emptyData';
import {
  Nmstate,
  NmstateInterface,
  isVlanInterface,
  NmstateEthernetInterface,
  NmstateVlanInterface,
} from './nmstateTypes';
import { isDummyInterface } from './dummyData';

/* handle four cases:
    1. right after create, there are no network wide configurations - yaml contains a dummy ipv4 interface and no machine network fields in the comments
    2. only network wide configurations - yaml contains only dummy interfaces and does contain machine network fileds in the comments
    3. fully configured, yaml contains one real interfaces
    4. user switched from ipv4 to dual stack - yaml contains one dummy interface for ipv6 (needed for routes section to work) and one real one for ipv4
  */
type ParsedFormViewYaml = {
  comments: string[];
  nmstate: Nmstate;
};

const findFirstRealInterface = (interfaces: NmstateInterface[]): NmstateInterface | undefined => {
  return interfaces.find(
    (currentInterface) => !isDummyInterface(currentInterface.name),
  ) as unknown as NmstateInterface | undefined;
};

const parseYaml = (yaml: string): ParsedFormViewYaml => {
  const lines = yaml.split('\n');
  const lastCommentIdx = findLastIndex(lines, (line) => line.startsWith(YAML_COMMENT_CHAR));
  const comments = lines.slice(0, lastCommentIdx + 1).map((line) => line.slice(1));
  return {
    comments: comments,
    nmstate: yamlToNmstateObject(yaml),
  };
};

const getVlanId = (interfaces: NmstateInterface[]): number | null => {
  for (const nmstateInterface of interfaces) {
    if (isVlanInterface(nmstateInterface)) {
      return nmstateInterface.vlan.id;
    }
  }
  return null;
};

const getIpAddress = (
  networkInterface: NmstateEthernetInterface | NmstateVlanInterface,
  protocolVersion: ProtocolVersion,
): string => {
  const ipAddressData = networkInterface[protocolVersion];
  if (ipAddressData === undefined) {
    return ''; //handle case 4
  }
  if (!ipAddressData.address || !ipAddressData.address.length) {
    throw `Nmstate yaml doesn't contain an address for protocol version ${protocolVersion}`;
  }
  return ipAddressData.address[0].ip;
};

const getDns = (nmstate: Nmstate): string => {
  const dnsServers = nmstate['dns-resolver']?.config.server;
  if (!dnsServers || !dnsServers.length) {
    throw `Nmstate YAML doesn't contain dns-resolver section`;
  }
  return dnsServers.join(',');
};

const getGateway = (nmstate: Nmstate, protocolVersion: ProtocolVersion): string => {
  const routesConfig = nmstate['routes']?.config;
  if (!routesConfig) {
    throw `Nmstate yaml doesn't contain routes section`;
  }
  return routesConfig[getProtocolVersionIdx(protocolVersion)]['next-hop-address'];
};

const getNetworkWideConfigurations = (
  nmstate: Nmstate,
  protocolType: StaticProtocolType,
  machineNetworks: { [protocolVersion in ProtocolVersion]: string },
): FormViewNetworkWideValues => {
  const vlanId = getVlanId(nmstate.interfaces);
  const networkWide = getEmptyNetworkWideConfigurations();
  networkWide.dns = getDns(nmstate);
  networkWide.protocolType = protocolType;
  if (vlanId) {
    networkWide.useVlan = true;
    networkWide.vlanId = vlanId;
  }
  for (const protocolVersion of getShownProtocolVersions(protocolType)) {
    networkWide.ipConfigs[protocolVersion].gateway = getGateway(nmstate, protocolVersion);
    const [ip, prefixLength] = machineNetworks[protocolVersion].split('/');
    networkWide.ipConfigs[protocolVersion].machineNetwork = {
      ip: ip,
      prefixLength: parseInt(prefixLength),
    };
  }
  return networkWide;
};

const getFormViewHost = (
  infraEnvHost: HostStaticNetworkConfig,
  protocolType: StaticProtocolType,
): FormViewHost | null => {
  if (!infraEnvHost.macInterfaceMap || !infraEnvHost.networkYaml) {
    throw `Static network config is missing information`;
  }

  const macAddress = infraEnvHost.macInterfaceMap[0].macAddress;
  if (!macAddress) {
    throw `Static network config is missing mac address`;
  }

  const { nmstate } = parseYaml(infraEnvHost.networkYaml);
  const realInterface = findFirstRealInterface(nmstate.interfaces);

  if (!realInterface) {
    //handle case 2
    return null;
  }

  //handle cases 3 and 4
  const ret: FormViewHost = {
    macAddress,
    ips: {
      ipv4: '',
      ipv6: '',
    },
  };

  for (const protocolVersion of getShownProtocolVersions(protocolType)) {
    ret.ips[protocolVersion] = getIpAddress(realInterface, protocolVersion);
  }
  return ret;
};

export const formDataFromInfraEnvField = (
  staticHostConfigs: HostStaticNetworkConfig[],
): StaticFormData => {
  if (!staticHostConfigs.length) {
    throw `Static network config is empty`;
  }
  const firstHostConfig = staticHostConfigs[0];
  if (!firstHostConfig.macInterfaceMap || !firstHostConfig.networkYaml) {
    throw 'Static network config first host is missing fields';
  }
  const { comments, nmstate } = parseYaml(firstHostConfig.networkYaml);
  const protocolType = getProtocolType(comments);
  if (!protocolType) {
    //handle case 1
    return {
      networkWide: getEmptyNetworkWideConfigurations(),
      hosts: [],
    };
  }
  const machineNetworks = getMachineNetworks(comments);
  const networkWide = getNetworkWideConfigurations(nmstate, protocolType, machineNetworks);
  //handles cases 2 - 4
  const hosts: FormViewHost[] = [];
  for (const hostConfig of staticHostConfigs) {
    const formViewHost = getFormViewHost(hostConfig, protocolType);
    if (formViewHost) {
      //in case 2 - formViewHost will be null and won't be added to hosts
      //in case 3 - formViewHost will contain all required data
      //in case 4 - host will contain ipv4 address and user will need to configure ipv6. the static ip wizard step will be recognized as incomplete
      hosts.push(formViewHost);
    }
  }
  return {
    networkWide: networkWide,
    hosts: hosts,
  };
};
