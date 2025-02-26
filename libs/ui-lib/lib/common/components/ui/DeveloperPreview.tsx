import React from 'react';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { PreviewBadge, PreviewBadgeProps } from './PreviewBadge';
import { DEVELOPER_SUPPORT_LEVEL_LINK } from '../../config/docs_links';

export type DeveloperPreviewProps = Omit<PreviewBadgeProps, 'text' | 'popoverContent'>;

export const DeveloperPreview: React.FC<DeveloperPreviewProps> = (props) => {
  const { t } = useTranslation();
  return (
    <PreviewBadge
      text={t('ai:Developer Preview')}
      popoverContent={t(
        'ai:Developer preview features are not intended to be used in production environments. The clusters deployed with the developer preview features are considered to be development clusters and are not supported through the Red Hat Customer Portal case management system.',
      )}
      externalLink={DEVELOPER_SUPPORT_LEVEL_LINK}
      {...props}
    />
  );
};
DeveloperPreview.displayName = 'DeveloperPreview';
