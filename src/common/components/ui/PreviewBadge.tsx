import React from 'react';
import { Label, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { TECH_SUPPORT_LEVEL_LINK } from '../../config/constants';
import ExternalLink from './ExternalLink';

export enum PreviewBadgePosition {
  default,
  inline,
  inlineRight,
}

type PreviewBadgeProps = {
  position?: PreviewBadgePosition;
  className?: string;
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
      >
        {text}
      </Label>
    </Popover>
  );
};

export type DeveloperPreviewProps = Pick<PreviewBadgeProps, 'className' | 'position'>;

export type TechnologyPreviewProps = DeveloperPreviewProps;

const popoverTexts = {
  'tech-preview': `Technology preview features provide early access to upcoming product innovations, 
  enabling you to test functionality and provide feedback during the development process.`,
  'dev-preview': `Developer Preview features provide early access to upcoming innovations and contain 
  a functional set of features that Red Hat is encouraging customers to use and provide feedback on.`,
};

export const DeveloperPreview: React.FC<DeveloperPreviewProps> = (props) => (
  <PreviewBadge text="Developer Preview" popoverText={popoverTexts['dev-preview']} {...props} />
);

export const TechnologyPreview: React.FC<TechnologyPreviewProps> = (props) => (
  <PreviewBadge
    text="Technology Preview"
    popoverText={popoverTexts['tech-preview']}
    externalLink={TECH_SUPPORT_LEVEL_LINK}
    {...props}
  />
);
