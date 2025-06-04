import React from 'react';
import { Label, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import ExternalLink from './ExternalLink';
import { WithTestID } from '../../types';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export enum PreviewBadgePosition {
  default,
  inline,
  inlineRight,
}

export type PreviewBadgeProps = {
  position?: PreviewBadgePosition;
  className?: string;
  text: string;
  externalLink?: string;
  popoverContent: React.ReactNode;
} & WithTestID;

export const PreviewBadge: React.FC<PreviewBadgeProps> = ({
  position = PreviewBadgePosition.inline,
  className = 'pf-v6-u-ml-md',
  text,
  popoverContent,
  externalLink,
  testId,
}) => {
  let clsName = className;
  const { t } = useTranslation();
  switch (position) {
    case PreviewBadgePosition.inlineRight:
      clsName += ' pf-v6-u-float-right';
      break;
    case PreviewBadgePosition.inline:
      clsName += ' pf-v6-u-display-inline';
      break;
  }
  const bodyContent = (
    <>
      <div style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>{popoverContent}</div>
      {externalLink && (
        <>
          <ExternalLink href={externalLink}>{t('ai:Learn more')}</ExternalLink>
        </>
      )}
    </>
  );
  return (
    <span onClick={(e) => e.preventDefault()}>
      <Popover bodyContent={bodyContent} position="top" withFocusTrap={false}>
        <Label
          style={{ cursor: 'pointer' }}
          color="orange"
          icon={<InfoCircleIcon />}
          className={clsName}
          {...(testId ? { 'data-testid': testId } : {})}
        >
          {text}
        </Label>
      </Popover>
    </span>
  );
};
PreviewBadge.displayName = 'PreviewBadge';
