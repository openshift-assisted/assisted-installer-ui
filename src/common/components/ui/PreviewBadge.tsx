import React from 'react';
import { Label, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { TECH_SUPPORT_LEVEL_LINK } from '../../config/constants';
import ExternalLink from './ExternalLink';
import { WithTestID } from '../../types';

export type DeveloperPreviewProps = {
  position?: PreviewBadgePosition;
  className?: string;
} & WithTestID;

export type TechnologyPreviewProps = DeveloperPreviewProps;

export enum PreviewBadgePosition {
  default,
  inline,
  inlineRight,
}

type PreviewBadgeProps = DeveloperPreviewProps & {
  text: string;
  externalLink?: string;
  popoverText: string;
};

const PreviewBadge: React.FC<PreviewBadgeProps> = ({
  position = PreviewBadgePosition.inline,
  className = 'pf-u-ml-md',
  text,
  popoverText,
  externalLink,
  testId,
}) => {
  let clsName = className;
  switch (position) {
    case PreviewBadgePosition.inlineRight:
      clsName += ' pf-u-float-right';
      break;
    case PreviewBadgePosition.inline:
      clsName += ' pf-u-display-inline';
      break;
  }
  const bodyContent = (
    <>
      <div style={{ marginBottom: 'var(--pf-global--spacer--sm)' }}>{popoverText}</div>
      {externalLink && (
        <>
          <ExternalLink href={externalLink}>Learn more</ExternalLink>
        </>
      )}
    </>
  );

  return (
    <Popover bodyContent={bodyContent} position="top">
      <Label
        style={{ cursor: 'pointer' }}
        color="orange"
        onClick={(e) => e.preventDefault()}
        icon={<InfoCircleIcon color="var(--pf-c-label__content--Color)" />}
        className={clsName}
        data-testid={`${testId}`}
      >
        {text}
      </Label>
    </Popover>
  );
};

const popoverTexts = {
  'tech-preview': `Technology preview features provide early access to upcoming product innovations, 
  enabling you to test functionality and provide feedback during the development process.`,
  'dev-preview': `Developer preview features are not intended to be used in production environments. 
  The clusters deployed with the developer preview features are considered to be development clusters and are not supported through the Red Hat Customer Portal case management system.`,
};

export const DeveloperPreview: React.FC<DeveloperPreviewProps> = (props) => (
  <PreviewBadge text="Developer Preview" popoverText={popoverTexts['dev-preview']} {...props} />
);
DeveloperPreview.displayName = 'DeveloperPreview';

export const TechnologyPreview: React.FC<TechnologyPreviewProps> = (props) => (
  <PreviewBadge
    text="Technology Preview"
    popoverText={popoverTexts['tech-preview']}
    externalLink={TECH_SUPPORT_LEVEL_LINK}
    {...props}
  />
);
TechnologyPreview.displayName = 'TechnologyPreview';
