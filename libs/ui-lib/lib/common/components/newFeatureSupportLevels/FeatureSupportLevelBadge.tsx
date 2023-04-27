import React from 'react';
import { SupportLevel } from '../../api/types';
import { FeatureId, isPreviewSupportLevel } from '../../types';
import { TechnologyPreview, DeveloperPreview } from '../ui/PreviewBadge';
import { useNewFeatureSupportLevel } from './FeatureSupportLevelContext';

export type NewSupportLevelBadgeProps = {
  featureId: FeatureId;
  openshiftVersion: string | undefined;
};

const NewFeatureSupportLevelBadge: React.FC<NewSupportLevelBadgeProps> = ({
  featureId,
  openshiftVersion,
}) => {
  const featureSupportLevelData = useNewFeatureSupportLevel();
  const supportLevel: SupportLevel | undefined = React.useMemo(() => {
    if (!openshiftVersion) {
      return undefined;
    }
    return featureSupportLevelData.getFeatureSupportLevel(featureId);
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

export default NewFeatureSupportLevelBadge;
