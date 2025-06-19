import {
  ArchitectureSupportLevelId,
  FeatureSupportLevelId,
  PlatformType,
  SupportLevel,
} from '@openshift-assisted/types/assisted-installer-service';
import { CpuArchitecture, FeatureId, SupportedCpuArchitecture } from '../../types';

export type NewFeatureSupportLevelMap = Record<FeatureSupportLevelId, SupportLevel>;
export type ArchitectureSupportLevelMap = Record<ArchitectureSupportLevelId, SupportLevel>;

export type ActiveFeatureConfiguration = {
  underlyingCpuArchitecture: CpuArchitecture;
  hasStaticIpNetworking: boolean;
};

export type GetFeatureDisabledReason = (
  featureId: FeatureId,
  supportLevelData?: NewFeatureSupportLevelMap,
  cpuArchitecture?: SupportedCpuArchitecture,
  platformType?: PlatformType,
  title?: string,
) => string | undefined;

export type GetFeatureSupportLevel = (
  featureId: FeatureId,
  supportLevelData?: NewFeatureSupportLevelMap,
) => SupportLevel | undefined;

export type NewFeatureSupportLevelData = {
  getFeatureSupportLevels(): NewFeatureSupportLevelMap;
  getFeatureSupportLevel: GetFeatureSupportLevel;
  isFeatureDisabled(featureId: FeatureId, supportLevelData?: NewFeatureSupportLevelMap): boolean;
  getFeatureDisabledReason: GetFeatureDisabledReason;
  isFeatureSupported: (
    featureId: FeatureId,
    supportLevelData?: NewFeatureSupportLevelMap,
  ) => boolean;
  activeFeatureConfiguration?: ActiveFeatureConfiguration;
};
