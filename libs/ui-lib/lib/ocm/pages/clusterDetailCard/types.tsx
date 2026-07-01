import { HistoryRouterProps } from 'react-router';
import { AssistedInstallerOCMPermissionTypesListType, FeatureListType } from '../../../common';

export type AssistedInstallerDetailCardProps = {
  aiClusterId: string;
  allEnabledFeatures: FeatureListType;
  history: HistoryRouterProps['history'];
  basename: HistoryRouterProps['basename'];
  permissions?: AssistedInstallerOCMPermissionTypesListType;
};
