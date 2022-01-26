import { FeatureSupportLevel } from '../api/types';

//extract array element type
type ArrayElementType<TWhere> = TWhere extends (infer U)[] ? (U extends object ? U : never) : never;

type Features = Required<ArrayElementType<FeatureSupportLevel['features']>>;
export type FeatureId = Features['featureId'] | 'ODF' | 'CNV' | 'NETWORK_TYPE_SELECTION';
export type SupportLevel = Features['supportLevel'];

export type FeatureIdToSupportLevel = {
  [id in FeatureId]?: SupportLevel;
};

export type FeatureSupportLevelsMap = {
  version?: FeatureIdToSupportLevel;
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
