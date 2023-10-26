import React from 'react';
import { TECH_SUPPORT_LEVEL_LINK } from '../../config/constants';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { PreviewBadge, PreviewBadgeProps } from './PreviewBadge';

export type TechnologyPreviewProps = Omit<
  PreviewBadgeProps,
  'text' | 'popoverText' | 'externalLink'
>;

export const TechnologyPreview: React.FC<TechnologyPreviewProps> = (props) => {
  const { t } = useTranslation();

  return (
    <PreviewBadge
      text={t('ai:Technology Preview')}
      popoverText={t(
        'ai:Technology preview features provide early access to upcoming product innovations, enabling you to test functionality and provide feedback during the development process.',
      )}
      externalLink={TECH_SUPPORT_LEVEL_LINK}
      {...props}
    />
  );
};
TechnologyPreview.displayName = 'TechnologyPreview';
