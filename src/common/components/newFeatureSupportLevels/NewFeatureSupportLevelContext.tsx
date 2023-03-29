import React from 'react';
import { TFunction } from 'i18next';

import { CpuArchitecture, FeatureId, SupportLevel } from '../../types';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { SupportLevels } from '../../api';

export type ActiveFeatureConfiguration = {
  underlyingCpuArchitecture: CpuArchitecture;
  hasStaticIpNetworking: boolean;
};

export type NewFeatureSupportLevelData = {
  getFeatureSupportLevels(): SupportLevels;
  getFeatureSupportLevel(
    featureId: FeatureId,
    supportLevelData?: SupportLevels,
  ): SupportLevel | undefined;
  isFeatureDisabled(featureId: FeatureId, supportLevelData?: SupportLevels): boolean;
  getFeatureDisabledReason(
    featureId: FeatureId,
    t?: TFunction,
    supportLevelData?: SupportLevels,
  ): string | undefined;
  isFeatureSupported(featureId: FeatureId, supportLevelData?: SupportLevels): boolean;
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
