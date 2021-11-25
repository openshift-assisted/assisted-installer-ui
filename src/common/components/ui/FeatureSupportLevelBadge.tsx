import { Popover } from '@patternfly/react-core';
import React from 'react';
import { TECH_SUPPORT_LEVEL_LINK } from '../../config/constants';
import { FeatureSupportLevelContext } from '../../contexts';
import { FeatureId, SupportLevel, isPreviewSupportLevel } from '../../types';
import ExternalLink from './ExternalLink';
import {
  TechnologyPreview,
  DeveloperPreview,
  PreviewBadgePosition,
  DeveloperPreviewProps,
} from './PreviewBadge';

export type SupportLevelBadgeProps = {
  featureId: FeatureId;
  openshiftVersion?: string;
} & DeveloperPreviewProps;

const popoverTexts = {
  'tech-preview': `Technology preview features provide early access to upcoming product innovations, 
  enabling you to test functionality and provide feedback during the development process.`,
  'dev-preview': `Developer Preview features provide early access to upcoming innovations and contain 
  a functional set of features that Red Hat is encouraging customers to use and provide feedback on.`,
};

export const FeatureSupportLevelBadge: React.FC<SupportLevelBadgeProps> = ({
  featureId,
  openshiftVersion,
  className = 'pf-u-ml-md',
  position = PreviewBadgePosition.inline,
  ...props
}) => {
  const supportLevelData = React.useContext(FeatureSupportLevelContext);
  const supportLevel: SupportLevel | undefined = supportLevelData.getFeatureSupportLevel(
    featureId,
    openshiftVersion,
  );
  if (!isPreviewSupportLevel(supportLevel)) {
    return null;
  }
  const Component = supportLevel === 'tech-preview' ? TechnologyPreview : DeveloperPreview;
  const bodyContent = (
    <>
      <p>
        {popoverTexts[supportLevel]}
        {supportLevel === 'tech-preview' && (
          <>
            <br />
            <ExternalLink href={TECH_SUPPORT_LEVEL_LINK}>Learn more</ExternalLink>
          </>
        )}
      </p>
    </>
  );
  return (
    <Popover bodyContent={bodyContent}>
      <Component position={position} className={className} {...props} />
    </Popover>
  );
};
