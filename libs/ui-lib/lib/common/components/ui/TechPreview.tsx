import React from 'react';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { PreviewBadge, PreviewBadgeProps } from './PreviewBadge';
import { TECH_SUPPORT_LEVEL_LINK } from '../../config/docs_links';

export type TechPreviewProps = Omit<PreviewBadgeProps, 'text' | 'popoverContent'>;

export const TechPreview: React.FC<TechPreviewProps> = (props) => {
  const { t } = useTranslation();
  return (
    <PreviewBadge
      text={t('ai:Tech Preview')}
      popoverContent={t(
        'ai:Tech preview features are not intended to be used in production environments. The clusters deployed with the developer preview features are considered to be development clusters and are not supported through the Red Hat Customer Portal case management system.',
      )}
      externalLink={TECH_SUPPORT_LEVEL_LINK}
      {...props}
    />
  );
};
TechPreview.displayName = 'TechPreview';
