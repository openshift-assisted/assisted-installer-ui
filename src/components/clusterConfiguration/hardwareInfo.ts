import Humanize from 'humanize-plus';
import { BlockDevice, Introspection, Nic } from '../../api/types';
import { DASH } from '../constants';
import { HumanizedSortable } from '../ui/table/utils';

export type HostRowHardwareInfo = {
  cores: HumanizedSortable;
  cpuSpeed: string;
  memory: HumanizedSortable;
  disk: HumanizedSortable;
  disks: BlockDevice[];
  nics: Nic[];
};

const toCamelCase = (str: string): string =>
  str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('_', ''));

export const getHardwareInfo = (hwInfoString: string): Introspection | undefined => {
  if (hwInfoString) {
    try {
      const camelCased = hwInfoString.replace(
        /"([\w]+)":/g,
        (_match, offset) => `"${toCamelCase(offset)}":`,
      );
      const hwInfo = JSON.parse(camelCased);
      return hwInfo;
    } catch (e) {
      console.error('Failed to parse Hardware Info', e, hwInfoString);
    }
  } else {
    console.info('Empty hardwareInfo received.');
  }
  return undefined;
};

export const getMemoryCapacity = (hwInfo: Introspection) => hwInfo.memory?.[0]?.total || 0;

export const getDisks = (hwInfo: Introspection): BlockDevice[] =>
  hwInfo.blockDevices?.filter((device: BlockDevice) => device.deviceType === 'disk') || [];

export const getNics = (hwInfo: Introspection): Nic[] => hwInfo.nics || [];

export const getHumanizedCpuClockSpeed = (hwInfo: Introspection) =>
  Humanize.formatNumber(hwInfo.cpu?.cpuMhz || 0);

export const getHumanizedTime = (time: string | undefined): HumanizedSortable => {
  if (!time) {
    return {
      title: DASH,
      sortableValue: 0,
    };
  }

  const date = new Date(time);
  return {
    title: date.toLocaleString(),
    sortableValue: date.getTime(),
  };
};

const EMPTY = {
  title: DASH,
  sortableValue: 0,
};

export const getHostRowHardwareInfo = (hwInfo: Introspection): HostRowHardwareInfo => {
  let cores = EMPTY;
  let memory = EMPTY;
  let disk = EMPTY;
  let cpuSpeed = DASH;

  if (hwInfo.cpu?.cpus) {
    cpuSpeed = `${hwInfo.cpu?.cpus}x ${getHumanizedCpuClockSpeed(hwInfo)} MHz`;
    // already total per mahcine (cores x sockets). WIll be changed by https://github.com/filanov/bm-inventory/pull/108
    cores = {
      title: hwInfo.cpu?.cpus.toString(),
      sortableValue: hwInfo.cpu?.cpus,
    };
  }

  const memCapacity = getMemoryCapacity(hwInfo);
  if (memCapacity) {
    memory = {
      title: Humanize.fileSize(memCapacity),
      sortableValue: memCapacity,
    };
  }

  const disksCapacity = getDisks(hwInfo).reduce(
    (diskSize: number, device: BlockDevice) => diskSize + (device?.size || 0),
    0,
  );
  if (disksCapacity) {
    disk = {
      title: Humanize.fileSize(disksCapacity),
      sortableValue: disksCapacity,
    };
  }

  return {
    cores,
    cpuSpeed,
    memory,
    disk,
    disks: getDisks(hwInfo),
    nics: getNics(hwInfo),
  };
};
