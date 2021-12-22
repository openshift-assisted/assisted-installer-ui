import React from 'react';
import { Label, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { TECH_SUPPORT_LEVEL_LINK } from '../../config/constants';
import ExternalLink from './ExternalLink';
import { WithTestID } from '../../types';

export type TechnologyPreviewProps = {
  position?: PreviewBadgePosition;
  className?: string;
} & WithTestID;

export enum PreviewBadgePosition {
  default,
  inline,
  inlineRight,
}

type PreviewBadgeProps = TechnologyPreviewProps & {
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

const popoverText = `Technology preview features provide early access to upcoming product innovations, 
  enabling you to test functionality and provide feedback during the development process.`;

export const TechnologyPreview: React.FC<TechnologyPreviewProps> = (props) => (
  <PreviewBadge
    text="Technology Preview"
    popoverText={popoverText}
    externalLink={TECH_SUPPORT_LEVEL_LINK}
    {...props}
  />
);
