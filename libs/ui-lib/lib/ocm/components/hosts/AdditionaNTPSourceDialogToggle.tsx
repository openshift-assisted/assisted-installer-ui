import React from 'react';
import { AlertActionLink } from '@patternfly/react-core';
import { useSelector } from 'react-redux';
import { useModalDialogsContext } from './ModalDialogsContext';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { selectCurrentCluster } from '../../store/slices/current-cluster/selectors';

export const AdditionalNTPSourcesDialogToggle = () => {
  const {
    additionalNTPSourcesDialog: { open },
  } = useModalDialogsContext();
  const { t } = useTranslation();
  const cluster = useSelector(selectCurrentCluster);
  if (cluster?.ntpSources?.trim()) {
    return (
      <span>
        {t(
          'ai:This cluster replaces default NTP sources with a custom list. To update the list, change NTP sources in the Add hosts dialog, generate a new discovery ISO, and reboot discovery hosts.',
        )}
      </span>
    );
  }

  return (
    <>
      <div>
        {t("ai:Manually fix the host's NTP configuration or provide additional NTP sources.")}
      </div>
      <br />
      <AlertActionLink onClick={() => open()}>{t('ai:Add NTP sources')}</AlertActionLink>
    </>
  );
};
