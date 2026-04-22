import { describe, expect, test } from 'vitest';
import { CpuArchitecture } from '../../../common/types/cpuArchitecture';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { ClusterVersionK8sResource } from '../../types/k8s/cluster-version';
import { OsImage } from '../../types/k8s/agent-service-config';
import {
  getCurrentClusterVersion,
  getNetworkType,
  getOCPVersions,
  getSelectedVersion,
  getVersionFromClusterImageSet,
} from './versions';
import { OpenshiftVersionOptionType } from '../../../common/types/versions';

const ClusterImageSetApiVersion = 'hive.openshift.io/v1';
const ClusterImageSetKind = 'ClusterImageSet';

function makeClusterImageSet(
  overrides: Partial<ClusterImageSetK8sResource> & {
    metadata: NonNullable<ClusterImageSetK8sResource['metadata']>;
  },
): ClusterImageSetK8sResource {
  return {
    apiVersion: ClusterImageSetApiVersion,
    kind: ClusterImageSetKind,
    ...overrides,
  };
}

function makeOsImage(overrides: Partial<OsImage> & Pick<OsImage, 'openshiftVersion'>): OsImage {
  const { openshiftVersion, ...rest } = overrides;
  return {
    cpuArchitecture: 'x86_64',
    openshiftVersion,
    url: 'https://example.com',
    version: '1',
    ...rest,
  };
}

describe('getVersionFromClusterImageSet', () => {
  test('uses releaseTag when releaseImage is digest-only', () => {
    const cis = makeClusterImageSet({
      metadata: {
        name: 'img4.21.3-multi-appsub',
        labels: { visible: 'true', releaseTag: '4.21.3-multi' },
      },
      spec: {
        releaseImage: 'quay.io/openshift-release-dev/ocp-release@sha256:abc123',
      },
    });
    expect(getVersionFromClusterImageSet(cis)).toBe('4.21.3-multi');
  });

  test('falls back to releaseImage when releaseTag is absent', () => {
    const cis = makeClusterImageSet({
      metadata: { name: 'img4.15.36-multi-appsub', labels: { visible: 'true' } },
      spec: {
        releaseImage: 'quay.io/openshift-release-dev/ocp-release:4.15.36-multi',
      },
    });
    expect(getVersionFromClusterImageSet(cis)).toBe('4.15.36-multi');
  });

  test('falls back to metadata.name when tag and image do not parse', () => {
    const cis = makeClusterImageSet({
      metadata: {
        name: 'img4.18.10-multi-appsub',
        labels: { visible: 'true' },
      },
      spec: {
        releaseImage: 'quay.io/openshift-release-dev/ocp-release@sha256:abc123',
      },
    });
    expect(getVersionFromClusterImageSet(cis)).toBe('img4.18.10-multi-appsub');
  });
});

describe('getOCPVersions', () => {
  test('excludes image sets without visible true when extended is false', () => {
    const hidden = makeClusterImageSet({
      metadata: {
        name: '4.16.1',
        labels: { visible: 'false', releaseTag: '4.16.1' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.16.1-x86_64' },
    });
    expect(getOCPVersions([hidden])).toEqual([]);
  });

  test('includes image sets without visible true when extended is true', () => {
    const hidden = makeClusterImageSet({
      metadata: {
        name: '4.16.2',
        labels: { releaseTag: '4.16.2' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.16.2-x86_64' },
    });
    const result = getOCPVersions([hidden], undefined, undefined, true);
    expect(result).toHaveLength(1);
    expect(result[0]?.version).toBe('4.16.2');
    expect(result[0]?.default).toBe(true);
  });

  test('sorts by label descending', () => {
    const a = makeClusterImageSet({
      metadata: {
        name: 'img-a',
        labels: { visible: 'true', releaseTag: '4.15.0' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.15.0-x86_64' },
    });
    const b = makeClusterImageSet({
      metadata: {
        name: 'img-b',
        labels: { visible: 'true', releaseTag: '4.21.0' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.21.0-x86_64' },
    });
    const result = getOCPVersions([a, b]);
    expect(result.map((v) => v.version)).toEqual(['4.21.0', '4.15.0']);
  });

  test('marks only the first sorted option as default', () => {
    const first = makeClusterImageSet({
      metadata: {
        name: 'first',
        labels: { visible: 'true', releaseTag: '4.14.0' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.14.0-x86_64' },
    });
    const second = makeClusterImageSet({
      metadata: {
        name: 'second',
        labels: { visible: 'true', releaseTag: '4.16.0' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.16.0-x86_64' },
    });
    const result = getOCPVersions([first, second]);
    expect(result[0]?.default).toBe(true);
    expect(result[1]?.default).toBe(false);
  });

  test('dedupes by version string keeping first in sorted order', () => {
    const dupA = makeClusterImageSet({
      metadata: {
        name: 'dup-a',
        labels: { visible: 'true', releaseTag: '4.17.0' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.17.0-x86_64' },
    });
    const dupB = makeClusterImageSet({
      metadata: {
        name: 'dup-b',
        labels: { visible: 'true', releaseTag: '4.17.0' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.17.0-x86_64' },
    });
    const other = makeClusterImageSet({
      metadata: {
        name: 'other',
        labels: { visible: 'true', releaseTag: '4.16.0' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.16.0-x86_64' },
    });
    const result = getOCPVersions([dupA, dupB, other]);
    expect(result.map((v) => v.value)).toEqual(['dup-a', 'other']);
    expect(result.map((v) => v.version)).toEqual(['4.17.0', '4.16.0']);
  });

  test('when isNutanix, keeps only x86_64 or x86-64 release images or matching architecture label', () => {
    const x86 = makeClusterImageSet({
      metadata: {
        name: 'nut-x86',
        labels: { visible: 'true', releaseTag: '4.16.0' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.16.0-x86_64' },
    });
    const multi = makeClusterImageSet({
      metadata: {
        name: 'nut-multi',
        labels: { visible: 'true', releaseTag: '4.16.1-mutli', architecture: 'multi' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.16.1-multi' },
    });
    const result = getOCPVersions([x86, multi], true);
    expect(result.map((v) => v.value)).toEqual(['nut-x86']);
  });

  test('when isNutanix, allows architecture label x86_64 even if release image suffix differs', () => {
    const cis = makeClusterImageSet({
      metadata: {
        name: 'nut-label',
        labels: { visible: 'true', releaseTag: '4.16.2-multi', architecture: 'x86_64' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.16.2-multi' },
    });
    const result = getOCPVersions([cis], true);
    expect(result).toHaveLength(1);
    expect(result[0]?.value).toBe('nut-label');
  });

  test('filters by osImages openshiftVersion major.minor', () => {
    const inRange = makeClusterImageSet({
      metadata: {
        name: 'in',
        labels: { visible: 'true', releaseTag: '4.18.55' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.18.55-x86_64' },
    });
    const outRange = makeClusterImageSet({
      metadata: {
        name: 'out',
        labels: { visible: 'true', releaseTag: '4.19.0' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.19.0-x86_64' },
    });
    const osImages = [makeOsImage({ openshiftVersion: '4.18' })];
    const result = getOCPVersions([inRange, outRange], false, osImages);
    expect(result.map((v) => v.value)).toEqual(['in']);
  });

  test('cpuArchitectures from labels.architecture x86_64', () => {
    const cis = makeClusterImageSet({
      metadata: {
        name: 'arch-x86',
        labels: { visible: 'true', releaseTag: '4.17.0-multi', architecture: 'x86_64' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.17.0-multi' },
    });
    const result = getOCPVersions([cis]);
    expect(result[0]?.cpuArchitectures).toEqual([CpuArchitecture.x86]);
  });

  test('cpuArchitectures from labels.architecture arm64', () => {
    const cis = makeClusterImageSet({
      metadata: {
        name: 'arch-arm',
        labels: { visible: 'true', releaseTag: '4.17.0-multi', architecture: 'arm64' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.17.0-multi' },
    });
    const result = getOCPVersions([cis]);
    expect(result[0]?.cpuArchitectures).toEqual([CpuArchitecture.ARM]);
  });

  test('cpuArchitectures from labels.architecture multi', () => {
    const cis = makeClusterImageSet({
      metadata: {
        name: 'arch-multi',
        labels: { visible: 'true', releaseTag: '4.17.0-multi', architecture: 'multi' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.17.0-multi' },
    });
    const result = getOCPVersions([cis]);
    expect(result[0]?.cpuArchitectures).toEqual([CpuArchitecture.MULTI]);
  });

  test('cpuArchitectures from labels.architecture s390x', () => {
    const cis = makeClusterImageSet({
      metadata: {
        name: 'arch-s390x',
        labels: { visible: 'true', releaseTag: '4.17.0-multi', architecture: 's390x' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.17.0-multi' },
    });
    const result = getOCPVersions([cis]);
    expect(result[0]?.cpuArchitectures).toEqual([CpuArchitecture.s390x]);
  });

  test('cpuArchitectures normalizes x86-64 from release string when tag and image agree', () => {
    const cis = makeClusterImageSet({
      metadata: {
        name: 'img4.17.1-x86-64-appsub',
        labels: {
          visible: 'true',
          releaseTag: '4.17.1-x86-64',
        },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.17.1-x86-64' },
    });
    const result = getOCPVersions([cis]);
    expect(result[0]?.cpuArchitectures).toEqual([CpuArchitecture.x86]);
  });

  test('labels.architecture takes precedence over releaseTag arch segment', () => {
    const cis = makeClusterImageSet({
      metadata: {
        name: 'prec',
        labels: {
          visible: 'true',
          releaseTag: '4.19.0-multi',
          architecture: 'x86_64',
        },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.19.0-multi' },
    });
    const result = getOCPVersions([cis]);
    expect(result[0]?.cpuArchitectures).toEqual([CpuArchitecture.x86]);
  });

  test('cpuArchitectures undefined when no arch in labels or release strings', () => {
    const cis = makeClusterImageSet({
      metadata: {
        name: 'ocp-release4.17.0',
        labels: { visible: 'true', releaseTag: '4.17.0' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.17.0' },
    });
    const result = getOCPVersions([cis]);
    expect(result[0]?.cpuArchitectures).toBeUndefined();
  });
});

describe('getSelectedVersion', () => {
  test('returns parsed version when cluster image matches imageSetRef', () => {
    const cis = makeClusterImageSet({
      metadata: {
        name: 'my-imageset',
        labels: { visible: 'true', releaseTag: '4.18.10' },
      },
      spec: { releaseImage: 'quay.io/ocp/release:4.18.10-x86_64' },
    });
    const aci = {
      apiVersion: 'extensions.hive.openshift.io/v1beta1',
      kind: 'AgentClusterInstall',
      metadata: { name: 'aci', namespace: 'ns' },
      spec: { imageSetRef: { name: 'my-imageset' } },
    } as AgentClusterInstallK8sResource;
    expect(getSelectedVersion([cis], aci)).toBe('4.18.10');
  });

  test('returns imageSetRef name when no cluster image matches', () => {
    const aci = {
      apiVersion: 'extensions.hive.openshift.io/v1beta1',
      kind: 'AgentClusterInstall',
      metadata: { name: 'aci', namespace: 'ns' },
      spec: { imageSetRef: { name: 'missing' } },
    } as AgentClusterInstallK8sResource;
    expect(getSelectedVersion([], aci)).toBe('missing');
  });

  test('returns undefined when imageSetRef is missing', () => {
    const aci = {
      apiVersion: 'extensions.hive.openshift.io/v1beta1',
      kind: 'AgentClusterInstall',
      metadata: { name: 'aci', namespace: 'ns' },
      spec: {},
    } as AgentClusterInstallK8sResource;
    expect(getSelectedVersion([], aci)).toBeUndefined();
  });
});

describe('getCurrentClusterVersion', () => {
  test('prefers status.history[0].version', () => {
    const cv = {
      apiVersion: 'config.openshift.io/v1',
      kind: 'ClusterVersion',
      metadata: { name: 'version' },
      spec: {
        channel: 'fast-4.18',
        clusterID: 'id',
        desiredUpdate: { version: '4.18.99', image: 'img' },
      },
      status: {
        desired: { version: '4.18.0', image: 'img' },
        history: [
          {
            version: '4.18.5',
            state: 'Completed' as const,
            startedTime: '',
            completionTime: '',
            image: '',
            verified: true,
          },
        ],
        observedGeneration: 1,
        versionHash: 'h',
        availableUpdates: [],
      },
    } as ClusterVersionK8sResource;
    expect(getCurrentClusterVersion(cv)).toBe('4.18.5');
  });

  test('falls back to spec.desiredUpdate.version when history is empty', () => {
    const cv = {
      apiVersion: 'config.openshift.io/v1',
      kind: 'ClusterVersion',
      metadata: { name: 'version' },
      spec: {
        channel: 'fast-4.18',
        clusterID: 'id',
        desiredUpdate: { version: '4.18.99', image: 'img' },
      },
      status: {
        desired: { version: '4.18.0', image: 'img' },
        history: [],
        observedGeneration: 1,
        versionHash: 'h',
        availableUpdates: [],
      },
    } as ClusterVersionK8sResource;
    expect(getCurrentClusterVersion(cv)).toBe('4.18.99');
  });

  test('returns undefined when no version is available', () => {
    const cv = {
      apiVersion: 'config.openshift.io/v1',
      kind: 'ClusterVersion',
      metadata: { name: 'version' },
      spec: {
        channel: 'fast-4.18',
        clusterID: 'id',
      },
      status: {
        desired: { version: '4.18.0', image: 'img' },
        history: [],
        observedGeneration: 1,
        versionHash: 'h',
        availableUpdates: [],
      },
    } as ClusterVersionK8sResource;
    expect(getCurrentClusterVersion(cv)).toBeUndefined();
  });
});

describe('getNetworkType', () => {
  test('returns OpenShiftSDN when version is below 4.12', () => {
    const v: OpenshiftVersionOptionType = {
      label: 'OpenShift 4.11.5',
      version: '4.11.5',
      value: 'x',
      default: false,
      supportLevel: 'production',
    };
    expect(getNetworkType(v)).toBe('OpenShiftSDN');
  });

  test('returns OVNKubernetes when version is 4.12 or higher', () => {
    const v: OpenshiftVersionOptionType = {
      label: 'OpenShift 4.12.0',
      version: '4.12.0',
      value: 'x',
      default: false,
      supportLevel: 'production',
    };
    expect(getNetworkType(v)).toBe('OVNKubernetes');
  });

  test('returns OVNKubernetes when ocpVersion is undefined', () => {
    expect(getNetworkType(undefined)).toBe('OVNKubernetes');
  });

  test('returns OVNKubernetes when version string is empty', () => {
    const v: OpenshiftVersionOptionType = {
      label: 'OpenShift ',
      version: '',
      value: 'x',
      default: false,
      supportLevel: 'production',
    };
    expect(getNetworkType(v)).toBe('OVNKubernetes');
  });
});
