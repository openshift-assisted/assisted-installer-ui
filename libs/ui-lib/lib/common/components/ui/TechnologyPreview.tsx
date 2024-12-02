import React from 'react';
import { TECH_SUPPORT_LEVEL_LINK } from '../../config/docs_links';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { PreviewBadge, PreviewBadgeProps } from './PreviewBadge';

export type TechnologyPreviewProps = Omit<
  PreviewBadgeProps,
  'text' | 'popoverContent' | 'externalLink'
>;

export const TechnologyPreview: React.FC<TechnologyPreviewProps> = (props) => {
  const { t } = useTranslation();

  return (
    <PreviewBadge
      text={t('ai:Technology Preview')}
      popoverContent={t(
        'ai:Technology preview features provide early access to upcoming product innovations, enabling you to test functionality and provide feedback during the development process.',
      )}
      externalLink={TECH_SUPPORT_LEVEL_LINK}
      {...props}
    />
  );
};
TechnologyPreview.displayName = 'TechnologyPreview';
