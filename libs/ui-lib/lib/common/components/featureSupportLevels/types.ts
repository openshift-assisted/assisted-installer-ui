import { ArchitectureSupportLevelMap, NewFeatureSupportLevelMap } from '../newFeatureSupportLevels';

export interface ArchitecturesSupportsLevel {
  architectures: ArchitectureSupportLevelMap;
}

export interface FeaturesSupportsLevel {
  features: NewFeatureSupportLevelMap;
}
