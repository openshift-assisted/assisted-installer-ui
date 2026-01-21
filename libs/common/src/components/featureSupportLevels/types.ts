import {
  ArchitectureSupportLevelMap,
  NewFeatureSupportLevelMap,
} from '../newFeatureSupportLevels/types';

export interface ArchitecturesSupportsLevel {
  architectures: ArchitectureSupportLevelMap;
}

export interface FeaturesSupportsLevel {
  features: NewFeatureSupportLevelMap;
}
