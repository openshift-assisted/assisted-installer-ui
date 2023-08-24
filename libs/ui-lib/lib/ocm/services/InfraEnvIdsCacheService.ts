import { CpuArchitecture, getAllCpuArchitectures } from '../../common';
import { Cluster, InfraEnv } from '@openshift-assisted/types/assisted-installer-service';

const CACHE_KEY = 'infra-env-ids-cache-v2';

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
  getInfraEnvId(clusterId: string, cpuArchitecture: CpuArchitecture): string | Error;
  removeInfraEnvId(clusterId: string, cpuArchitecture: CpuArchitecture): void;
  removeInfraEnvs(clusterId: string): void;
  updateInfraEnvs(clusterId: string, infraEnvs: InfraEnv[]): void;
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

  getInfraEnvId(clusterId: string, cpuArchitecture: CpuArchitecture): string | Error {
    if (!clusterId || !cpuArchitecture) {
      return new Error(`clusterId or cpuArchitecture are missing`);
    }

    const cache = read();
    const clusterInfraEnvs = cache[clusterId];
    if (!clusterInfraEnvs) {
      return new Error(`Not infraEnvs found for this cluster ${clusterId}`);
    }
    if (
      cpuArchitecture !== CpuArchitecture.USE_DAY1_ARCHITECTURE &&
      cpuArchitecture !== CpuArchitecture.MULTI
    ) {
      return clusterInfraEnvs[cpuArchitecture] || new Error(`InfraEnv can't be found`);
    }

    const architectures = getAllCpuArchitectures().filter((arch) => {
      return clusterInfraEnvs[arch];
    });

    if (architectures.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return clusterInfraEnvs[architectures[0]]!;
    }
    throw new Error(
      `More than one infraEnv found for cluster ${clusterId} without specified architecture`,
    );
  },

  removeInfraEnvId(clusterId: string, cpuArchitecture: CpuArchitecture): void {
    if (!clusterId) {
      return;
    }

    const cache = read();
    if (cpuArchitecture === CpuArchitecture.USE_DAY1_ARCHITECTURE) {
      delete cache[clusterId];
    } else if (cache[clusterId]) {
      delete cache[clusterId][cpuArchitecture];
    }
    update(cache);
  },

  removeInfraEnvs(clusterId: string): void {
    if (!clusterId) {
      return;
    }

    const cache = read();
    delete cache[clusterId];
    update(cache);
  },

  updateInfraEnvs(clusterId: string, infraEnvs: InfraEnv[]): void {
    if (!clusterId) {
      return;
    }

    const cache = read();
    if (!cache[clusterId]) {
      cache[clusterId] = {};
    }
    infraEnvs.forEach((infraEnv) => {
      if (infraEnv.cpuArchitecture) {
        cache[clusterId][infraEnv.cpuArchitecture as CpuArchitecture] = infraEnv.id;
      }
    });
    update(cache);
  },
};

export default InfraEnvIdsCacheService;
