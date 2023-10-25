import React from 'react';
import { SupportLevel } from '@openshift-assisted/types/assisted-installer-service';
import { FeatureId, isPreviewSupportLevel } from '../../types';
import { TechnologyPreview } from '../ui/TechnologyPreview';
import { DeveloperPreview } from '../ui/DeveloperPreview';
import { useFeatureSupportLevel } from './FeatureSupportLevelContext';

export type SupportLevelBadgeProps = {
  featureId: FeatureId;
  openshiftVersion: string | undefined;
};

const FeatureSupportLevelBadge: React.FC<SupportLevelBadgeProps> = ({
  featureId,
  openshiftVersion,
}) => {
  const featureSupportLevelData = useFeatureSupportLevel();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const supportLevel: SupportLevel | undefined = React.useMemo(() => {
    if (!openshiftVersion) {
      return undefined;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
