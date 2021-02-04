import React from 'react';

// Must conform Unleash constants
type AssistedInstallerFeatureType = 'ASSISTED_INSTALLER_SNO_FEATURE';
export type FeatureListType = {
  [key in AssistedInstallerFeatureType]: boolean;
};

// Hardcoded outside OCM
export const SINGLE_CLUSTER_ENABLED_FEATURES: FeatureListType = {
  ASSISTED_INSTALLER_SNO_FEATURE: false,
};

// Hardcoded outside OCM
export const STANDALONE_DEPLOYMENT_ENABLED_FEATURES: FeatureListType = {
  ASSISTED_INSTALLER_SNO_FEATURE: true,
};

export type FeatureGateContextType = {
  isFeatureEnabled: (feature: AssistedInstallerFeatureType) => boolean;
};

export const FeatureGateContext = React.createContext<FeatureGateContextType>({
  isFeatureEnabled: () => false,
});

export const FeatureGateContextProvider: React.FC<{
  features: FeatureListType;
}> = ({ features, children }) => {
  const isFeatureEnabled = (feature: AssistedInstallerFeatureType) => {
    return features[feature];
  };

  return (
    <FeatureGateContext.Provider value={{ isFeatureEnabled }}>
      {children}
    </FeatureGateContext.Provider>
  );
};

export const useFeature = (feature: AssistedInstallerFeatureType): boolean => {
  const { isFeatureEnabled } = React.useContext(FeatureGateContext);
  return isFeatureEnabled(feature);
};
