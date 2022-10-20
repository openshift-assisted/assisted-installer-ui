import { Cluster, CpuArchitecture, InfraEnv } from '../../common';

const CACHE_KEY = 'infra-env-ids-cache';

type ClusterInfraEnvIds = Partial<Record<CpuArchitecture, InfraEnv['id']>>;
type InfraEnvCache = Record<Cluster['id'], ClusterInfraEnvIds>;

const update = (cache: InfraEnvCache): void => {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

const read = (): InfraEnvCache => {
  const EMPTY_CACHE = '{}';
  const cache = localStorage.getItem(CACHE_KEY) || EMPTY_CACHE;

  try {
    return JSON.parse(cache) as InfraEnvCache;
  } catch {
    return {};
  }
};

type InfraEnvStorage = Omit<Storage, 'getItem' | 'removeItem' | 'setItem'> & {
  getInfraEnvId(clusterId: string, cpuArchitecture: CpuArchitecture): string | null;
  removeInfraEnvId(clusterId: string, cpuArchitecture: CpuArchitecture): void;
  setInfraEnvs(clusterId: string, infraEnvs: InfraEnv[]): void;
};

const InfraEnvIdsCacheService: InfraEnvStorage = {
  key(index: number): string | null {
    const cache = read();
    return Object.keys(cache)[index];
  },

  get length(): number {
    const cache = read();
    return Object.keys(cache).length;
  },

  clear(): void {
    localStorage.removeItem(CACHE_KEY);
  },

  getInfraEnvId(clusterId: string, cpuArchitecture: CpuArchitecture): string | null {
    if (!clusterId || !cpuArchitecture) {
      return null;
    }

    const cache = read();
    const clusterInfraEnvs = cache[clusterId];
    if (!clusterInfraEnvs) {
      return null;
    }
    return clusterInfraEnvs[cpuArchitecture] || null;
  },

  removeInfraEnvId(clusterId: string, cpuArchitecture: CpuArchitecture): void {
    if (!clusterId) {
      return;
    }

    const cache = read();
    if (cache[clusterId]) {
      delete cache[clusterId][cpuArchitecture];
    }
    update(cache);
  },

  setInfraEnvs(clusterId: string, infraEnvs: InfraEnv[]): void {
    if (!clusterId) {
      return;
    }

    const cache = read();
    if (!cache[clusterId]) {
      cache[clusterId] = {};
    }
    infraEnvs.forEach((infraEnv) => {
      if (infraEnv.cpuArchitecture) {
        cache[clusterId][infraEnv.cpuArchitecture] = infraEnv.id;
      }
    });
    update(cache);
  },
};

export default InfraEnvIdsCacheService;
