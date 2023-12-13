import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import React from 'react';
import { global_success_color_100 as okColor } from '@patternfly/react-tokens/dist/js/global_success_color_100';
import { Text, TextList, TextListItem, TextContent } from '@patternfly/react-core';
import {
  FeatureId,
  FeatureIdToSupportLevel,
  PreviewSupportLevel,
  isPreviewSupportLevel,
} from '../../../common/types';
import { TECH_SUPPORT_LEVEL_LINK } from '../../../common/config/constants';
import ExternalLink from '../../../common/components/ui/ExternalLink';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { DetailItem } from '../../../common';
import { getLimitedFeatureSupportLevels } from '../../../common/components/newFeatureSupportLevels/utils';
import { WithErrorBoundary } from '../../../common/components/ErrorHandling/WithErrorBoundary';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import useOpenshiftVersions from '../../hooks/useOpenshiftVersions';
import { TFunction } from 'i18next';
import {
  NewFeatureSupportLevelData,
  useNewFeatureSupportLevel,
} from '../../../common/components/newFeatureSupportLevels';

const getFeatureReviewText = (featureId: FeatureId): string => {
  switch (featureId) {
    case 'SNO':
      return 'Install single node OpenShift (SNO)';
    case 'VIP_AUTO_ALLOC':
      return 'Allocate IPs via DHCP server';
    case 'ARM64_ARCHITECTURE':
      return 'Use ARM architecture for the cluster';
    default:
      return featureId;
  }
};

const getPreviewSupportLevelTitle = (supportLevel: PreviewSupportLevel) => {
  if (supportLevel === 'dev-preview') {
    return 'Developer Preview Features';
  }
  return <ExternalLink href={TECH_SUPPORT_LEVEL_LINK}>Technology Preview Features</ExternalLink>;
};

const getPreviewFeatureList = (supportLevelMap: FeatureIdToSupportLevel) => {
  const previewSupportLevels: { [key in PreviewSupportLevel]: FeatureId[] } = {
    'tech-preview': [],
    'dev-preview': [],
  };
  for (const [featureId, supportLevel] of Object.entries(supportLevelMap)) {
    if (!isPreviewSupportLevel(supportLevel)) {
      continue;
    }
    previewSupportLevels[supportLevel].push(featureId as FeatureId);
  }
  let supportLevel: PreviewSupportLevel;
  //Show only one preview support level list, first priority to developer preview features
  if (previewSupportLevels['dev-preview'].length) {
    supportLevel = 'dev-preview';
  } else if (previewSupportLevels['tech-preview'].length) {
    supportLevel = 'tech-preview';
  } else {
    return null;
  }
  const featureList = previewSupportLevels[supportLevel].map((featureId: FeatureId) => (
    <TextListItem key={featureId}>{getFeatureReviewText(featureId)}</TextListItem>
  ));
  return (
    <>
      <TextListItem>
        {getPreviewSupportLevelTitle(supportLevel)}
        <TextList>{featureList}</TextList>
      </TextListItem>
    </>
  );
};

export const LimitedSupportedCluster = ({
  clusterFeatureSupportLevels,
  showVersionWarning,
}: {
  clusterFeatureSupportLevels: FeatureIdToSupportLevel;
  showVersionWarning: boolean;
}) => (
  <TextContent>
    {showVersionWarning && (
      <Text>
        <InfoCircleIcon size="sm" color="var(--pf-global--info-color--100)" />
        &nbsp;The installed OpenShift version is not production-ready
      </Text>
    )}
    {Object.keys(clusterFeatureSupportLevels).length > 0 && (
      <>
        <InfoCircleIcon size="sm" color="var(--pf-global--info-color--100)" />
        &nbsp;Your cluster will be subject to support limitations because it includes:
        <TextList>{getPreviewFeatureList(clusterFeatureSupportLevels)}</TextList>
      </>
    )}
  </TextContent>
);

export const FullySupportedCluster = () => (
  <>
    <CheckCircleIcon color={okColor.value} />
    &nbsp;Your installed cluster will be fully supported
  </>
);

export const getFeatureSupportLevelTitle = (fullySupported: boolean): string => {
  const supportLevel: string = fullySupported ? 'Full' : 'Limited';
  return `Cluster support level: ${supportLevel}`;
};

type SupportLevelProps = { cluster: Cluster };
export type SupportLevelMemo = {
  limitedClusterFeatures: FeatureIdToSupportLevel;
  hasSupportedVersion: boolean;
  isFullySupported: boolean;
};

export const getSupportLevelInfo = (
  cluster: Cluster,
  featureSupportLevelData: NewFeatureSupportLevelData,
  isSupportedOpenShiftVersion: (version?: string) => boolean,
  t: TFunction,
) => {
  const limitedClusterFeatures = getLimitedFeatureSupportLevels(
    cluster,
    featureSupportLevelData,
    t,
  );
  const hasSupportedVersion: boolean = isSupportedOpenShiftVersion(cluster.openshiftVersion);
  return {
    limitedClusterFeatures,
    hasSupportedVersion,
    isFullySupported: hasSupportedVersion && Object.keys(limitedClusterFeatures || {}).length === 0,
  };
};

const SupportLevel = ({ cluster }: SupportLevelProps) => {
  const { t } = useTranslation();
  const featureSupportLevelData = useNewFeatureSupportLevel();
  const { isSupportedOpenShiftVersion } = useOpenshiftVersions();

  const { limitedClusterFeatures, hasSupportedVersion, isFullySupported } =
    React.useMemo<SupportLevelMemo>(
      () => getSupportLevelInfo(cluster, featureSupportLevelData, isSupportedOpenShiftVersion, t),
      [cluster, featureSupportLevelData, t, isSupportedOpenShiftVersion],
    );

  if (!limitedClusterFeatures) {
    return null;
  }

  return (
    <DetailItem
      title={getFeatureSupportLevelTitle(isFullySupported)}
      value={
        isFullySupported ? (
          <FullySupportedCluster />
        ) : (
          <LimitedSupportedCluster
            clusterFeatureSupportLevels={limitedClusterFeatures}
            showVersionWarning={!hasSupportedVersion}
          />
        )
      }
      classNameValue={'pf-u-mb-md'}
      testId="feature-support-levels"
    />
  );
};

const ClusterFeatureSupportLevelsDetailItem = ({ ...props }: SupportLevelProps) => (
  <WithErrorBoundary title="Failed to load feature support levels">
    <SupportLevel {...props} />
  </WithErrorBoundary>
);
export default ClusterFeatureSupportLevelsDetailItem;
