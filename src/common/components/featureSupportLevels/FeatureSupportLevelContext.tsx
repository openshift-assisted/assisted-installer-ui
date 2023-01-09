import React from 'react';
import { FeatureId, FeatureIdToSupportLevel, SupportLevel } from '../../types';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { TFunction } from 'i18next';

export type FeatureSupportLevelData = {
  getVersionSupportLevelsMap(version: string): FeatureIdToSupportLevel | undefined;
  getFeatureSupportLevel(version: string, featureId: FeatureId): SupportLevel | undefined;
  isFeatureDisabled(version: string, featureId: FeatureId): boolean;
  getFeatureDisabledReason(
    version: string,
    featureId: FeatureId,
    t?: TFunction,
  ): string | undefined;
  isFeatureSupported(version: string, featureId: FeatureId): boolean;
};

const FeatureSupportLevelContext = React.createContext<FeatureSupportLevelData | null>(null);

export const FeatureSupportLevelContextProvider: React.FC<{
  children: React.ReactNode;
  value: FeatureSupportLevelData;
}> = ({ value, children }) => {
  return (
    <FeatureSupportLevelContext.Provider value={value}>
      {children}
    </FeatureSupportLevelContext.Provider>
  );
};

export const useFeatureSupportLevel = () => {
  const context = React.useContext(FeatureSupportLevelContext);

  const { t } = useTranslation();
  if (!context) {
    throw new Error(
      t('ai:useFeatureSupportLevel must be used within FeatureSupportLevelContextProvider.'),
    );
  }
  return context;
};
