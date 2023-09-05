import React from 'react';

// Must conform Unleash constants
export type AssistedInstallerFeatureType =
  | 'ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE'
  | 'ASSISTED_INSTALLER_MULTIARCH_SUPPORTED';

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
  ASSISTED_INSTALLER_MULTIARCH_SUPPORTED: true,
};

// Hardcoded outside OCM
export const STANDALONE_DEPLOYMENT_ENABLED_FEATURES: FeatureListType = {
  ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE: false,
  ASSISTED_INSTALLER_MULTIARCH_SUPPORTED: true,
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
  // hardcoded defaults
  // TODO (mortegag): Remove all multiarch capacity related code in the UI.
  const featuresWithDefaults: FeatureListType = {
    ASSISTED_INSTALLER_MULTIARCH_SUPPORTED: true,
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
