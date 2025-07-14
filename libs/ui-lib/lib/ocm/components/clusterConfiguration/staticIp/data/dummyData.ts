import {
  HostStaticNetworkConfig,
  MacInterfaceMap,
} from '@openshift-assisted/types/assisted-installer-service';
import {
  FormViewNetworkWideValues,
  ProtocolVersion,
  StaticIpInfo,
  StaticIpView,
} from './dataTypes';
import { NmstateEthernetInterface, NmstateInterfaceType } from './nmstateTypes';
import { FORM_VIEW_PREFIX, getNmstateProtocolConfig, toYamlWithComments } from './nmstateYaml';
import { getShownProtocolVersions } from '../../../../../common/components/staticIP/protocolVersion';

const DUMMY_MAC_4 = '01:23:45:67:89:AB';
const DUMMY_MAC_6 = '01:23:45:67:89:AC';
const DUMMY_NIC_PREFIX = 'DUMMY';

export const getDummyNicName = (protocolVersion: ProtocolVersion) => {
  const protocolNumber = protocolVersion === ProtocolVersion.ipv4 ? 4 : 6;
  return `${DUMMY_NIC_PREFIX}${protocolNumber}`;
};

export const getDummyMacAddress = (protocolVersion: ProtocolVersion) => {
  if (protocolVersion === ProtocolVersion.ipv4) {
    return DUMMY_MAC_4;
  } else {
    return DUMMY_MAC_6;
  }
};

export const DUMMY_NMSTATE_ADDRESSES = {
  ipv4: {
    prefixLength: 24,
    ip: '0.0.0.0',
  },
  ipv6: {
    prefixLength: 64,
    ip: '0::0',
  },
};

export const getDummyInterfaces = (): NmstateEthernetInterface[] => {
  return [
    {
      name: getDummyNicName(ProtocolVersion.ipv4),
      type: NmstateInterfaceType.ETHERNET,
      state: 'up',
      ipv4: getNmstateProtocolConfig(
        DUMMY_NMSTATE_ADDRESSES.ipv4.ip,
        DUMMY_NMSTATE_ADDRESSES.ipv4.prefixLength,
      ),
    },
  ];
};

export const getDummyMacInterfaceMap = (
  networkWideConfiguration?: FormViewNetworkWideValues,
): MacInterfaceMap => {
  const macInterfaceMap = [];
  if (networkWideConfiguration) {
    for (const protocolVersion of getShownProtocolVersions(networkWideConfiguration.protocolType)) {
      macInterfaceMap.push({
        macAddress: getDummyMacAddress(protocolVersion),
        logicalNicName: getDummyNicName(protocolVersion),
      });
    }
    return macInterfaceMap;
  } else {
    return [{ macAddress: DUMMY_MAC_4, logicalNicName: getDummyNicName(ProtocolVersion.ipv4) }];
  }
};

export const isDummyInterface = (nicName: string) => {
  return nicName.startsWith(DUMMY_NIC_PREFIX);
};

export const isDummyYaml = (yaml: string): boolean => {
  return yaml.includes(DUMMY_NIC_PREFIX);
};

export const getDummyInfraEnvField = (): HostStaticNetworkConfig[] => {
  const json = { interfaces: getDummyInterfaces() };
  const comments = [FORM_VIEW_PREFIX];
  const dummyYaml = toYamlWithComments(json, comments);
  return [{ networkYaml: dummyYaml, macInterfaceMap: getDummyMacInterfaceMap() }];
};

export const getDummyStaticIpInfo = (): StaticIpInfo => ({
  isDataComplete: false,
  view: StaticIpView.FORM,
  formViewProtocolType: null,
});
