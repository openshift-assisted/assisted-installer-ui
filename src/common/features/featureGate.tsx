import React from 'react';

// Must conform Unleash constants
type AssistedInstallerFeatureType =
  | 'ASSISTED_INSTALLER_SNO_FEATURE'
  | 'ASSISTED_INSTALLER_OCS_FEATURE'
  | 'ASSISTED_INSTALLER_ODF_FEATURE'
  | 'ASSISTED_INSTALLER_CNV_FEATURE'
  | 'ASSISTED_INSTALLER_NETWORK_TYPE_SELECTION_FEATURE'
  | 'ASSISTED_INSTALLER_PLATFORM_INTEGRATION_FEATURE';
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
  ASSISTED_INSTALLER_SNO_FEATURE: true,
  ASSISTED_INSTALLER_OCS_FEATURE: false,
  ASSISTED_INSTALLER_ODF_FEATURE: false,
  ASSISTED_INSTALLER_CNV_FEATURE: false,
  ASSISTED_INSTALLER_NETWORK_TYPE_SELECTION_FEATURE: false,
  ASSISTED_INSTALLER_PLATFORM_INTEGRATION_FEATURE: false,
};

// Hardcoded outside OCM
export const SINGLE_CLUSTER_ENABLED_FEATURES: FeatureListType = {
  ASSISTED_INSTALLER_SNO_FEATURE: false,
  ASSISTED_INSTALLER_OCS_FEATURE: false,
  ASSISTED_INSTALLER_ODF_FEATURE: false,
  ASSISTED_INSTALLER_CNV_FEATURE: false,
  ASSISTED_INSTALLER_NETWORK_TYPE_SELECTION_FEATURE: false,
  ASSISTED_INSTALLER_PLATFORM_INTEGRATION_FEATURE: false,
};

// Hardcoded outside OCM
export const STANDALONE_DEPLOYMENT_ENABLED_FEATURES: FeatureListType = {
  ASSISTED_INSTALLER_SNO_FEATURE: true,
  ASSISTED_INSTALLER_OCS_FEATURE: true,
  ASSISTED_INSTALLER_ODF_FEATURE: true,
  ASSISTED_INSTALLER_CNV_FEATURE: true,
  ASSISTED_INSTALLER_NETWORK_TYPE_SELECTION_FEATURE: true,
  ASSISTED_INSTALLER_PLATFORM_INTEGRATION_FEATURE: true,
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
  const featuresWithDefaults: FeatureListType = {
    ASSISTED_INSTALLER_OCS_FEATURE: false,
    ASSISTED_INSTALLER_ODF_FEATURE: false,
    ASSISTED_INSTALLER_CNV_FEATURE: false,
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
