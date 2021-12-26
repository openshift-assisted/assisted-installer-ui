import React from 'react';
import { FeatureId, SupportLevel, isPreviewSupportLevel } from '../../types';
import { TechnologyPreview, DeveloperPreview } from '../ui/PreviewBadge';
import FeatureSupportLevelContext from './FeatureSupportLevelContext';

export type SupportLevelBadgeProps = {
  featureId: FeatureId;
  openshiftVersion: string | undefined;
};

const FeatureSupportLevelBadge: React.FC<SupportLevelBadgeProps> = ({
  featureId,
  openshiftVersion,
}) => {
  const featureSupportLevelData = React.useContext(FeatureSupportLevelContext);
  const supportLevel: SupportLevel | undefined = React.useMemo(() => {
    if (!openshiftVersion) {
      return undefined;
    }
    return featureSupportLevelData.getFeatureSupportLevel(openshiftVersion, featureId);
  }, [openshiftVersion, featureId, featureSupportLevelData]);
  if (!isPreviewSupportLevel(supportLevel)) {
    return null;
  }
  const testId = `${featureId}-support-level`;
  return supportLevel === 'tech-preview' ? (
    <TechnologyPreview testId={testId} />
  ) : (
    <DeveloperPreview testId={testId} />
  );
};

export default FeatureSupportLevelBadge;
