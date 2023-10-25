import React from 'react';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { PreviewBadge, PreviewBadgeProps } from './PreviewBadge';

export type DeveloperPreviewProps = Omit<PreviewBadgeProps, 'text' | 'popoverText'>;

export const DeveloperPreview: React.FC<DeveloperPreviewProps> = (props) => {
  const { t } = useTranslation();
  return (
    <PreviewBadge
      text={t('ai:Developer Preview')}
      popoverText={t(
        'ai:Developer preview features are not intended to be used in production environments. The clusters deployed with the developer preview features are considered to be development clusters and are not supported through the Red Hat Customer Portal case management system.',
      )}
      {...props}
    />
  );
};
DeveloperPreview.displayName = 'DeveloperPreview';
