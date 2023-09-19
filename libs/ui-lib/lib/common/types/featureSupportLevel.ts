import { FeatureSupportLevelId, SupportLevel } from '../api/types';
import { ArrayElementType } from './typescriptExtensions';

type Features = Required<ArrayElementType<FeatureSupportLevelId>>;
export type FeatureId =
  | FeatureSupportLevelId
  | Features['featureId']
  | 'NETWORK_TYPE_SELECTION'
  | 'ARM64_ARCHITECTURE'
  | 'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING'
  | 'DUAL_STACK_NETWORKING'
  | 'MULTIARCH_RELEASE_IMAGE';

export type FeatureIdToSupportLevel = {
  [id in FeatureId]?: SupportLevel;
};

export type FeatureSupportLevelsMap = {
  [id in string /* means OCP normalized version */]: FeatureIdToSupportLevel;
};

export type ClusterFeatureUsage = {
  [key: string]: {
    id: FeatureId;
    name: string;
    data?: { [key: string]: unknown };
  };
};

export type PreviewSupportLevel = 'tech-preview' | 'dev-preview';

export const isPreviewSupportLevel = (
  supportLevel: SupportLevel | undefined,
): supportLevel is PreviewSupportLevel => {
  return supportLevel === 'dev-preview' || supportLevel === 'tech-preview';
};
