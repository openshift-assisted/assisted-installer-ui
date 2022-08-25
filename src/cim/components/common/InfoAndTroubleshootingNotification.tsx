import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import React from 'react';
import { MinimalHWRequirementsModal } from '../Agent/MinimalHWRequirements';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { DiscoveryTroubleshootingModal } from '../../../common/components/clusterConfiguration/DiscoveryTroubleshootingModal';
import { ConfigMapK8sResource } from '../../types/fromOCP/k8sTypes';

type InfoAndTroubleshootingNotificationProps = {
  isSNO?: boolean;
  assistedServiceConfigMap: ConfigMapK8sResource;
};

const InfoAndTroubleshootingNotification = ({
  isSNO = false,
  assistedServiceConfigMap,
}: InfoAndTroubleshootingNotificationProps) => {
  const { t } = useTranslation();
  const [isDiscoveryHintModalOpen, setIsDiscoveryHintModalOpen] = React.useState(false);
  const [isMinimalHWRequirementsModalOpen, setIsMinimalHWRequirementsModalOpen] =
    React.useState(false);
  return (
    <>
      <Alert
        variant={AlertVariant.info}
        title={t('ai:Information & Troubleshooting')}
        actionLinks={
          <>
            <AlertActionLink onClick={() => setIsMinimalHWRequirementsModalOpen(true)}>
              {t('ai:Minimum hardware requirements')}
            </AlertActionLink>
            <AlertActionLink onClick={() => setIsDiscoveryHintModalOpen(true)}>
              {t('ai:Host not showing up?', { count: +isSNO })}
            </AlertActionLink>
          </>
        }
        isInline
      />
      {isDiscoveryHintModalOpen && (
        <DiscoveryTroubleshootingModal
          isOpen={isDiscoveryHintModalOpen}
          setDiscoveryHintModalOpen={setIsDiscoveryHintModalOpen}
        />
      )}
      {isMinimalHWRequirementsModalOpen && (
        <MinimalHWRequirementsModal
          isSNOCluster={isSNO}
          aiConfigMap={assistedServiceConfigMap}
          isOpen={isMinimalHWRequirementsModalOpen}
          onClose={() => setIsMinimalHWRequirementsModalOpen(false)}
        />
      )}
    </>
  );
};

export default InfoAndTroubleshootingNotification;
