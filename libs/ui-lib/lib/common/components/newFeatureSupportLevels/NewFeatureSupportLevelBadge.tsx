import React from 'react';
import { SupportLevel } from '@openshift-assisted/types/assisted-installer-service';
import { FeatureId, isPreviewSupportLevel } from '../../types';
import { TechnologyPreview } from '../ui/TechnologyPreview';
import { DeveloperPreview } from '../ui/DeveloperPreview';

export type NewSupportLevelBadgeProps = {
  featureId: FeatureId;
  supportLevel: SupportLevel | undefined;
};

const NewFeatureSupportLevelBadge: React.FC<NewSupportLevelBadgeProps> = ({
  featureId,
  supportLevel,
}) => {
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
