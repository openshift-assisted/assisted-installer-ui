import { HistoryRouterProps } from 'react-router';
import { AssistedInstallerOCMPermissionTypesListType, FeatureListType } from '../../hooks';

export type AssistedInstallerDetailCardProps = {
  aiClusterId: string;
  allEnabledFeatures: FeatureListType;
  history: HistoryRouterProps['history'];
  basename: HistoryRouterProps['basename'];
  permissions?: AssistedInstallerOCMPermissionTypesListType;
};
