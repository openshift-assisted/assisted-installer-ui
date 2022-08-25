import { dump } from 'js-yaml';
import { HostStaticNetworkConfig, InfraEnv } from '../../../../../common';
import {
  ProtocolVersion,
  FormViewHost,
  FormViewNetworkWideValues,
  StaticFormData,
  HostIps,
} from './dataTypes';
import {
  FORM_VIEW_PREFIX,
  getDnsSection,
  getEthernetInterface,
  getMachineNetworkFieldName,
  getNmstateProtocolConfig,
  getRouteConfig,
  getVlanInterface,
  YAML_COMMENT_CHAR,
} from './nmstateYaml';
import { getShownProtocolVersions } from './protocolVersion';
import {
  Nmstate,
  NmstateInterface,
  NmstateProtocolConfigs,
  NmstateRoutesConfig,
} from './nmstateTypes';
import { formDataFromInfraEnvField } from './formDataFromInfraEnvField';
import { getStaticNetworkConfig } from './fromInfraEnv';
import { DUMMY_NMSTATE_ADDRESSES, getDummyMacInterfaceMap, getDummyNicName } from './dummyData';
import { getMachineNetworkCidr } from './machineNetwork';
import { getEmptyHostIps } from './emptyData';

const REAL_NIC_NAME = 'eth0';

const getPrefixLength = (
  networkWide: FormViewNetworkWideValues,
  protocolVersion: ProtocolVersion,
): number => {
  const machineNetwork = networkWide.ipConfigs[protocolVersion].machineNetwork;
  if (machineNetwork.prefixLength === '') {
    throw 'Machine network prefix length not configured';
  }
  return machineNetwork.prefixLength;
};

const toYamlWithComments = (json: object, comments: string[]) => {
  const yamlComments = comments.map((comment) => `${YAML_COMMENT_CHAR}${comment}`);
  return `${yamlComments.join('\n')}\n${dump(json, { noRefs: true })}`;
};

const getNmstateObject = (
  networkWide: FormViewNetworkWideValues,
  hostIps: Partial<HostIps>,
): Nmstate => {
  const interfaces: NmstateInterface[] = [];
  const routeConfigs: NmstateRoutesConfig[] = [];
  const dns = getDnsSection(networkWide.dns);
  const realProtocolConfigs: NmstateProtocolConfigs = {};
  for (const protocolVersion of getShownProtocolVersions(networkWide.protocolType)) {
    const hostIp = hostIps[protocolVersion];
    let nicName = '';
    if (hostIp) {
      nicName = REAL_NIC_NAME;
      realProtocolConfigs[protocolVersion] = getNmstateProtocolConfig(
        hostIp,
        getPrefixLength(networkWide, protocolVersion),
      );
    } else {
      //this happens when a host was particall configured, or not configured at all
      const protocolConfigs = {
        [protocolVersion]: getNmstateProtocolConfig(
          DUMMY_NMSTATE_ADDRESSES[protocolVersion].ip,
          DUMMY_NMSTATE_ADDRESSES[protocolVersion].prefixLength,
        ),
      };
      nicName = getDummyNicName(protocolVersion);
      interfaces.push(getEthernetInterface(nicName, protocolConfigs));
    }
    routeConfigs.push(
      getRouteConfig(protocolVersion, networkWide.ipConfigs[protocolVersion].gateway, nicName),
    );
  }
  if (Object.keys(realProtocolConfigs).length > 0) {
    interfaces.unshift(getEthernetInterface(REAL_NIC_NAME, realProtocolConfigs));
  }
  if (networkWide.useVlan && networkWide.vlanId) {
    let configs = [] as NmstateProtocolConfigs;
    interfaces.forEach((item) => {
      configs = {
        ipv4: item['ipv4'] ? item['ipv4'] : configs['ipv4'],
        ipv6: item['ipv6'] ? item['ipv6'] : configs['ipv6'],
      };
      delete item['ipv4'];
      delete item['ipv6'];
    });
    const vlanInterface = getVlanInterface(interfaces[0].name, networkWide.vlanId, configs);
    interfaces.push(vlanInterface);
    routeConfigs.forEach((route) => {
      route['next-hop-interface'] = vlanInterface.name;
    });
  }
  const nmstate = {
    interfaces,
    'dns-resolver': dns,
    routes: { config: routeConfigs },
  };
  return nmstate;
};

const toYaml = (
  networkWideConfiguration: FormViewNetworkWideValues,
  formHostData?: FormViewHost,
): string => {
  const comments = [FORM_VIEW_PREFIX];
  for (const protocolVersion of getShownProtocolVersions(networkWideConfiguration.protocolType)) {
    comments.push(
      `${getMachineNetworkFieldName(protocolVersion)} ${getMachineNetworkCidr(
        networkWideConfiguration.ipConfigs[protocolVersion].machineNetwork,
      )}`,
    );
  }
  const hostIps = formHostData ? formHostData.ips : getEmptyHostIps();
  const nmstate = getNmstateObject(networkWideConfiguration, hostIps);
  return toYamlWithComments(nmstate, comments);
};

const formDataToInfraEnvField = (formData: StaticFormData): HostStaticNetworkConfig[] => {
  let ret: HostStaticNetworkConfig[] = [];
  if (formData.hosts.length === 0) {
    //user only filled in network wide configuration and didn't fill in host specific configurations
    ret = [
      {
        networkYaml: toYaml(formData.networkWide),
        macInterfaceMap: getDummyMacInterfaceMap(),
      },
    ];
  } else {
    for (const host of formData.hosts) {
      ret.push({
        networkYaml: toYaml(formData.networkWide, host),
        macInterfaceMap: [
          {
            macAddress: host.macAddress,
            logicalNicName: REAL_NIC_NAME,
          },
        ],
      });
    }
  }
  return ret;
};

export const formViewHostsToInfraEnvField = (
  currentInfraEnv: InfraEnv,
  formViewHosts: FormViewHost[],
): HostStaticNetworkConfig[] => {
  const staticNetworkConfig = getStaticNetworkConfig(currentInfraEnv);
  if (!staticNetworkConfig) {
    throw `Infra env doesn't contain static ip values`;
  }
  const currentFormData = formDataFromInfraEnvField(staticNetworkConfig);
  const networkWide = currentFormData.networkWide;
  return formDataToInfraEnvField({
    networkWide: networkWide,
    hosts: formViewHosts,
  });
};

const fixHostIps = (networkWide: FormViewNetworkWideValues, hosts: FormViewHost[]) => {
  //fix host ips following changes in network wide configuration protocol type
  for (const host of hosts) {
    const newHostIps = getEmptyHostIps();
    for (const protocolVersion of getShownProtocolVersions(networkWide.protocolType)) {
      newHostIps[protocolVersion] = host.ips[protocolVersion];
    }
    host.ips = newHostIps;
  }
};

export const networkWideToInfraEnvField = (
  currentInfraEnv: InfraEnv,
  networkWide: FormViewNetworkWideValues,
): HostStaticNetworkConfig[] => {
  const staticNetworkConfig = getStaticNetworkConfig(currentInfraEnv);
  if (!staticNetworkConfig) {
    throw `Infra env doesn't contain static ip values`;
  }
  const currentFormData = formDataFromInfraEnvField(staticNetworkConfig);
  fixHostIps(networkWide, currentFormData.hosts);
  return formDataToInfraEnvField({ networkWide, hosts: currentFormData.hosts });
};
