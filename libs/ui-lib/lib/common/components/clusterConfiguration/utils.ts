import { Address4, Address6 } from 'ip-address';
import { TFunction } from 'i18next';
import {
  Cluster,
  ClusterDefaultConfig,
  ClusterNetwork,
  Host,
  Inventory,
  MachineNetwork,
  ServiceNetwork,
} from '@openshift-assisted/types/assisted-installer-service';
import { NO_SUBNET_SET } from '../../config';
import {
  selectClusterNetworkCIDR,
  selectClusterNetworkHostPrefix,
  selectServiceNetworkCIDR,
  selectSchedulableMasters,
  isClusterPlatformTypeVM,
} from '../../selectors';
import {
  ClusterCpuArchitecture,
  CpuArchitecture,
  HostDiscoveryValues,
  HostSubnets,
  OpenshiftVersionOptionType,
  StorageValues,
  Validation,
  ValidationGroup,
  ValidationsInfo,
  WithRequired,
} from '../../types';
import { getHostname } from '../hosts/utils';
import { stringToJSON } from '../../utils';

type VersionConfig = WithRequired<Pick<Cluster, 'openshiftVersion'>, 'openshiftVersion'> & {
  cpuArchitecture?: ClusterCpuArchitecture;
  versions?: OpenshiftVersionOptionType[];
  withPreviewText?: boolean;
  withMultiText?: boolean;
};

const getBetaVersionText = (
  openshiftVersion: string,
  versions: OpenshiftVersionOptionType[],
): string => {
  const versionSelected = versions.find((version) => version.version === openshiftVersion);
  return versionSelected?.supportLevel === 'beta' ? '- Developer preview release' : '';
};

const getMultiVersionText = (
  openshiftVersion: string,
  cpuArchitecture?: ClusterCpuArchitecture,
) => {
  if (!cpuArchitecture || openshiftVersion.includes('multi')) {
    return '';
  }
  return cpuArchitecture === CpuArchitecture.MULTI ? ' (multi)' : '';
};

export const getOpenshiftVersionText = (params: VersionConfig) => {
  return `${params.openshiftVersion} ${
    params.withPreviewText && params.versions
      ? getBetaVersionText(params.openshiftVersion, params.versions)
      : ''
  } ${
    params.withMultiText ? getMultiVersionText(params.openshiftVersion, params.cpuArchitecture) : ''
  }`;
};

export const getSubnet = (cidr: string): Address6 | Address4 | null => {
  if (Address4.isValid(cidr)) {
    return new Address4(cidr);
  } else if (Address6.isValid(cidr)) {
    return new Address6(cidr);
  } else {
    return null;
  }
};

export const getHumanizedSubnetRange = (subnet: Address6 | Address4 | null) => {
  if (subnet) {
    const subnetStart = subnet.startAddress().correctForm();
    const subnetEnd = subnet.endAddress().correctForm();
    return `(${subnetStart} - ${subnetEnd})`;
  }

  return '';
};

export const getHumanizedSubnet = (subnet: Address6 | Address4 | null) => {
  if (subnet) {
    return `${subnet.address} ${getHumanizedSubnetRange(subnet)}`;
  }
  return '';
};

const buildHostnameMap = (hosts: Host[]): { [id: string]: string } => {
  return hosts.reduce((acc, host) => {
    const inventory = stringToJSON<Inventory>(host.inventory) || {};
    acc = {
      ...acc,
      [host.id]: getHostname(host, inventory),
    };
    return acc;
  }, {});
};

export const getHostSubnets = (cluster: Cluster, addInvalidNetworks?: boolean): HostSubnets => {
  const hostnameMap = buildHostnameMap(cluster.hosts || []);

  // Transform the data to handle the optional values
  const hostNetworkList =
    cluster.hostNetworks?.map((hn) => ({
      cidr: hn.cidr || '',
      hostIds: hn.hostIds || [],
      isValid: true,
    })) || [];

  const hostNetworkCidrs = hostNetworkList.map((item) => item.cidr);
  if (addInvalidNetworks) {
    cluster.machineNetworks?.forEach((mn) => {
      // If the machine networks are not present in the hostNetworks (the interface may have changed),
      // it must be added so that it's shown as selected and the user can select the correct one
      if (!hostNetworkCidrs.includes(mn.cidr || '')) {
        hostNetworkList.push({
          cidr: mn.cidr || '',
          hostIds: [],
          isValid: false,
        });
      }
    });
  }

  return hostNetworkList.map((networkItem) => {
    return {
      subnet: networkItem.cidr,
      hostIDs: networkItem.hostIds.map((id) => hostnameMap[id] || id),
      humanized: getHumanizedSubnet(getSubnet(networkItem.cidr)),
      isValid: networkItem.isValid,
    };
  });
};

export const getSubnetFromMachineNetworkCidr = (machineNetworkCidr?: string) => {
  if (!machineNetworkCidr) {
    return NO_SUBNET_SET;
  }

  const subnet = getSubnet(machineNetworkCidr);
  return subnet?.address;
};

export const serviceNetworksEqual = (array1: ServiceNetwork[], array2: ServiceNetwork[]) => {
  const cidrs = array2.map((elem) => elem.cidr);
  return array1.length === array2.length && array1.every((network) => cidrs.includes(network.cidr));
};

export const clusterNetworksEqual = (array1: ClusterNetwork[], array2: ClusterNetwork[]) =>
  array1.length === array2.length &&
  array1.every((clusterNetwork) =>
    array2.find(
      (network) =>
        network.cidr === clusterNetwork.cidr && network.hostPrefix === clusterNetwork.hostPrefix,
    ),
  );

export const isAdvNetworkConf = (cluster: Cluster, defaultNetworkSettings: ClusterDefaultConfig) =>
  selectClusterNetworkCIDR(cluster) !== defaultNetworkSettings.clusterNetworkCidr ||
  selectClusterNetworkHostPrefix(cluster) !== defaultNetworkSettings.clusterNetworkHostPrefix ||
  selectServiceNetworkCIDR(cluster) !== defaultNetworkSettings.serviceNetworkCidr;

export const canSelectNetworkTypeSDN = (isSNO: boolean, isIPv6 = false) => {
  return !(isSNO || isIPv6);
};

export const canBeDualStack = (subnets: HostSubnets) =>
  subnets.some((subnet) => Address4.isValid(subnet.subnet)) &&
  subnets.some((subnet) => Address6.isValid(subnet.subnet));

const areNetworksDualStack = (
  networks: (MachineNetwork | ClusterNetwork | ServiceNetwork)[] | undefined,
) =>
  networks &&
  networks.length > 1 &&
  Address4.isValid(networks[0].cidr || '') &&
  Address6.isValid(networks[1].cidr || '');

export const isDualStack = ({
  machineNetworks,
  clusterNetworks,
  serviceNetworks,
}: Pick<Cluster, 'machineNetworks' | 'clusterNetworks' | 'serviceNetworks'>) =>
  areNetworksDualStack(machineNetworks) &&
  areNetworksDualStack(clusterNetworks) &&
  areNetworksDualStack(serviceNetworks);

export const isSubnetInIPv6 = ({
  clusterNetworkCidr,
  machineNetworkCidr,
  serviceNetworkCidr,
}: Pick<Cluster, 'clusterNetworkCidr' | 'machineNetworkCidr' | 'serviceNetworkCidr'>) =>
  Address6.isValid(clusterNetworkCidr || '') ||
  Address6.isValid(machineNetworkCidr || '') ||
  Address6.isValid(serviceNetworkCidr || '');

export const getHostDiscoveryInitialValues = (cluster: Cluster): HostDiscoveryValues => {
  return {
    usePlatformIntegration: isClusterPlatformTypeVM(cluster),
    schedulableMasters: selectSchedulableMasters(cluster),
  };
};

export const getStorageInitialValues = (): StorageValues => {
  // TODO (dchason): add initial values to node labeling
  return {
    nodeLabeling: '',
  };
};

export function filterValidationsInfoByGroup(
  validationsInfo: ValidationsInfo,
  selectedGroups: ValidationGroup[] = ['configuration', 'hosts-data', 'network', 'operators'],
): ValidationsInfo {
  const result: ValidationsInfo = {};
  Object.keys(validationsInfo).forEach((groupKeyStr) => {
    const groupKey = groupKeyStr as ValidationGroup;
    if (selectedGroups.includes(groupKey)) {
      result[groupKey] = validationsInfo[groupKey];
    }
  });
  return result;
}

export function filterValidationsInfoByStatus(
  validationsInfo: ValidationsInfo,
  selectedStatuses: Validation['status'][] = ['failure', 'pending', 'error'],
): ValidationsInfo {
  const result: ValidationsInfo = {};
  Object.entries(validationsInfo).forEach(([groupKeyStr, validations = []]) => {
    const filteredValidations = validations.filter((validation) =>
      selectedStatuses.includes(validation.status),
    );
    if (filteredValidations.length) {
      const groupKey = groupKeyStr as ValidationGroup;
      result[groupKey] = filteredValidations;
    }
  });
  return result;
}

type VipValidations = {
  'api-vips-defined': string | undefined;
  'ingress-vips-defined': string | undefined;
};

export const getVipValidationsById = (
  t: TFunction,
  validationsInfoString?: Cluster['validationsInfo'],
): { [key: string]: string | undefined } => {
  const validationsInfo = stringToJSON<ValidationsInfo>(validationsInfoString) || {};
  const failedDhcpAllocationMessageStubs = [
    t('ai:VIP IP allocation from DHCP server has been timed out'), // TODO(jtomasek): remove this one once it is no longer in backend
    t('ai:IP allocation from the DHCP server timed out.'),
  ];
  return (validationsInfo.network || []).reduce((lookup, validation) => {
    if (['api-vips-defined', 'ingress-vips-defined'].includes(validation.id)) {
      const vipId = validation.id as keyof VipValidations;
      lookup[vipId] =
        validation.status === 'failure' &&
        failedDhcpAllocationMessageStubs.find((stub) => validation.message.match(stub))
          ? validation.message
          : undefined;
    }
    return lookup;
  }, {} as VipValidations);
};
