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

export type NewFeatureSupportLevelData = {
  getFeatureSupportLevels(): NewFeatureSupportLevelMap;
  getFeatureSupportLevel(
    featureId: FeatureId,
    supportLevelData?: NewFeatureSupportLevelMap,
  ): SupportLevel | undefined;
  isFeatureDisabled(featureId: FeatureId, supportLevelData?: NewFeatureSupportLevelMap): boolean;
  getFeatureDisabledReason(
    featureId: FeatureId,
    supportLevelData?: NewFeatureSupportLevelMap,
    cpuArchitecture?: SupportedCpuArchitecture,
    platformType?: PlatformType,
  ): string | undefined;
  isFeatureSupported(featureId: FeatureId, supportLevelData?: NewFeatureSupportLevelMap): boolean;
  activeFeatureConfiguration?: ActiveFeatureConfiguration;
};
