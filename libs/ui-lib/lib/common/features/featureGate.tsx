import React from 'react';

// Must conform Unleash constants
export type AssistedInstallerFeatureType = 'ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE';

export type FeatureListType = {
  [key in AssistedInstallerFeatureType]?: boolean;
};

export type AssistedInstallerOCMPermissionTypes = 'canEdit';
export type AssistedInstallerOCMPermissionTypesListType = {
  [key in AssistedInstallerOCMPermissionTypes]: boolean;
};
export type AssistedInstallerPermissionTypes = 'isViewerMode';
export type AssistedInstallerPermissionTypesListType = {
  [key in AssistedInstallerPermissionTypes]: boolean;
};

// Hardcoded for ACM
export const ACM_ENABLED_FEATURES: FeatureListType = {
  ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE: false,
};

// Hardcoded outside OCM
export const STANDALONE_DEPLOYMENT_ENABLED_FEATURES: FeatureListType = {
  ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE: false,
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
  const featuresWithDefaults: FeatureListType = {
    ...features,
  };

  const isFeatureEnabled = (feature: AssistedInstallerFeatureType) => {
    // Configured via Unleash in the OCM
    return !!featuresWithDefaults[feature];
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
