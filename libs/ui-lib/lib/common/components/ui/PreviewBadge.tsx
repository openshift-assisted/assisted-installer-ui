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
  popoverText: string;
} & WithTestID;

export const PreviewBadge: React.FC<PreviewBadgeProps> = ({
  position = PreviewBadgePosition.inline,
  className = 'pf-v5-u-ml-md',
  text,
  popoverText,
  externalLink,
  testId,
}) => {
  let clsName = className;
  const { t } = useTranslation();
  switch (position) {
    case PreviewBadgePosition.inlineRight:
      clsName += ' pf-v5-u-float-right';
      break;
    case PreviewBadgePosition.inline:
      clsName += ' pf-v5-u-display-inline';
      break;
  }
  const bodyContent = (
    <>
      <div style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>{popoverText}</div>
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
          icon={<InfoCircleIcon color="var(--pf-v5-c-label__content--Color)" />}
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
