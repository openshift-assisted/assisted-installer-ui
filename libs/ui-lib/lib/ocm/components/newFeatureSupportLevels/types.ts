import {
  ArchitectureSupportLevelMap,
  NewFeatureSupportLevelMap,
} from '../../../common/components/newFeatureSupportLevels';

export interface ArchitecturesSupportsLevel {
  architectures: ArchitectureSupportLevelMap;
}

export interface FeaturesSupportsLevel {
  features: NewFeatureSupportLevelMap;
}
