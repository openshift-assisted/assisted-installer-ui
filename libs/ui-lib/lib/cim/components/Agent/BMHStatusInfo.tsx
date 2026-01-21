import React from 'react';
import {
  Level,
  LevelItem,
  Alert,
  AlertVariant,
  Content,
  ContentVariants,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { PendingIcon } from '@patternfly/react-icons/dist/js/icons/pending-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { t_global_color_status_success_default as okColor } from '@patternfly/react-tokens/dist/js/t_global_color_status_success_default';
import { t_global_icon_color_status_warning_default as warningColor } from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_warning_default';

import { useTranslation } from '../../../common';
import { BareMetalHostK8sResource } from '../../types';
import { getBMHStatus } from '../helpers';
import { BMHEventsModal } from './BMHEventsModal';

export const BMHStatusInfo = ({
  bmhStatus,
  bmh,
}: {
  bmhStatus: ReturnType<typeof getBMHStatus>;
  bmh: BareMetalHostK8sResource;
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = React.useState(false);

  let alertVariant = AlertVariant.warning;
  if (!!bmh.status?.errorMessage) {
    alertVariant = AlertVariant.danger;
  } else if (
    bmh.status?.provisioning?.state === 'provisioned' ||
    bmh.status?.provisioning?.state === 'externally provisioned'
  ) {
    alertVariant = AlertVariant.success;
  }

  let icon: React.ReactNode;
  switch (bmh.status?.operationalStatus) {
    case 'OK':
    case 'discovered':
      icon = <CheckCircleIcon color={okColor.value} />;
      break;
    case 'error':
      icon = <ExclamationTriangleIcon color={warningColor.value} />;
      break;
    default:
      icon = <PendingIcon />;
      break;
  }

  return (
    <>
      <Level>
        <LevelItem className="pf-v6-u-font-weight-bold">{t('ai:Bare metal host')}</LevelItem>
        <LevelItem>
          {bmh.status?.operationalStatus} {icon}
        </LevelItem>
      </Level>
      <Alert title={bmhStatus.state.title} variant={alertVariant} isInline>
        {!!bmh.status?.errorMessage && (
          <Content component={ContentVariants.p}>{bmh.status?.errorMessage}</Content>
        )}

        <Level hasGutter>
          <LevelItem>
            <Button variant={ButtonVariant.link} isInline onClick={() => setModalOpen(true)}>
              {t('ai:View BMH events')}
            </Button>
          </LevelItem>
          <LevelItem>
            <Content component={ContentVariants.small}>
              {t('ai:Last updated:')} {bmh.status?.lastUpdated}
            </Content>
          </LevelItem>
        </Level>
      </Alert>

      {isModalOpen && (
        <BMHEventsModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          namespace={bmh.metadata?.namespace || ''}
          bmhName={bmh.metadata?.name || ''}
        />
      )}
    </>
  );
};
