import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { StatusCondition } from './shared';

type UpdateHistory = {
  state: 'Completed' | 'Partial';
  startedTime: string;
  completionTime: string;
  version: string;
  image: string;
  verified: boolean;
};

export enum ClusterVersionConditionType {
  Available = 'Available',
  Failing = 'Failing',
  Progressing = 'Progressing',
  RetrievedUpdates = 'RetrievedUpdates',
  Invalid = 'Invalid',
  Upgradeable = 'Upgradeable',
}

type Release = {
  version: string;
  image: string;
  url?: string;
  channels?: string[];
};

export type ClusterVersionK8sResource = {
  spec: {
    channel: string;
    clusterID: string;
    desiredUpdate?: Release;
    upstream?: string;
  };
  status: {
    desired: Release;
    history: UpdateHistory[];
    observedGeneration: number;
    versionHash: string;
    conditions?: StatusCondition<keyof typeof ClusterVersionConditionType>[];
    availableUpdates: Release[];
    conditionalUpdates?: {
      release: Release;
      conditions: StatusCondition<string>[];
    }[];
  };
} & K8sResourceCommon;
