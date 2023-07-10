import React from 'react';

import { CpuArchitecture, FeatureId } from '../../types';
import { ArchitectureSupportLevelId, FeatureSupportLevelId, SupportLevel } from '../../api';

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
  ): string | undefined;
  isFeatureSupported(featureId: FeatureId, supportLevelData?: NewFeatureSupportLevelMap): boolean;
  activeFeatureConfiguration?: ActiveFeatureConfiguration;
};

const NewFeatureSupportLevelContext = React.createContext<NewFeatureSupportLevelData | null>(null);

export const NewFeatureSupportLevelContextProvider: React.FC<{
  children: React.ReactNode;
  value: NewFeatureSupportLevelData;
}> = ({ value, children }) => {
  return (
    <NewFeatureSupportLevelContext.Provider value={value}>
      {children}
    </NewFeatureSupportLevelContext.Provider>
  );
};

export const useNewFeatureSupportLevel = () => {
  const context = React.useContext(NewFeatureSupportLevelContext);
  if (!context) {
    throw new Error(
      'useNewFeatureSupportLevel must be used within NewFeatureSupportLevelContextProvider.',
    );
  }
  return context;
};
