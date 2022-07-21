import React from 'react';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

// TODO we should use hostValidationFailureHints instead of passing this 'action' which is actually a hint
export const AdditionalNTPSourcesDialogToggle: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      {t(
        "ai:NTP sources can be edited in Host's Infrastructure environment. After updating the NTP  sources, make sure to restart the host.",
      )}
    </>
  );
};
