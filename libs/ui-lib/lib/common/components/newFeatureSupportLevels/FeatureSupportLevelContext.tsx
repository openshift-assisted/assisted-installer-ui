import React from 'react';
import { TFunction } from 'i18next';

import { CpuArchitecture, FeatureId } from '../../types';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { SupportLevel, SupportLevels } from '../../api';

export type ActiveFeatureConfiguration = {
  underlyingCpuArchitecture: CpuArchitecture;
  hasStaticIpNetworking: boolean;
};

export type NewFeatureSupportLevelData = {
  getFeatureSupportLevels(): SupportLevels;
  getFeatureSupportLevel(featureId: FeatureId): SupportLevel | undefined;
  isFeatureDisabled(featureId: FeatureId): boolean;
  getFeatureDisabledReason(featureId: FeatureId, t?: TFunction): string | undefined;
  isFeatureSupported(featureId: FeatureId): boolean;
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
  const { t } = useTranslation();
  if (!context) {
    throw new Error(
      t('ai:useNewFeatureSupportLevel must be used within NewFeatureSupportLevelContextProvider.'),
    );
  }
  return context;
};
