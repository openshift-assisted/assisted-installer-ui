import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import React from 'react';
import { MinimalHWRequirementsModal } from '../Agent/MinimalHWRequirements';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { DiscoveryTroubleshootingModal } from '../../../common/components/clusterConfiguration/DiscoveryTroubleshootingModal';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import { MCEK8sResource } from '../../types/k8s/multi-cluster-engine';
import { MCEModel } from '../../types/models';
import { useStateSafely } from '../../../common';
import { useConfigMap } from '../../hooks/useConfigMap';

export const useAssistedServiceNamespace = () => {
  const [namespace, setNamespace] = useStateSafely<string | undefined>(undefined);

  React.useEffect(() => {
    const doItAsync = async () => {
      try {
        const multiClusterEngine = await k8sGet<MCEK8sResource>({
          model: MCEModel,
          name: 'multiclusterengine',
        });
        setNamespace(multiClusterEngine?.spec?.targetNamespace ?? 'multicluster-engine');
      } catch {
        setNamespace('multicluster-engine');
      }
    };
    void doItAsync();
  }, [setNamespace]);

  return namespace;
};

export const useAssistedServiceConfigMap = () => {
  const namespace = useAssistedServiceNamespace();
  return useConfigMap({ name: 'assisted-service', namespace });
};

type InfoAndTroubleshootingNotificationProps = {
  isSNO?: boolean;
};

const InfoAndTroubleshootingNotification = ({
  isSNO = false,
}: InfoAndTroubleshootingNotificationProps) => {
  const { t } = useTranslation();
  const [isDiscoveryHintModalOpen, setIsDiscoveryHintModalOpen] = React.useState(false);
  const [isMinimalHWRequirementsModalOpen, setIsMinimalHWRequirementsModalOpen] =
    React.useState(false);

  const [assistedServiceConfigMap] = useAssistedServiceConfigMap();

  if (!assistedServiceConfigMap) {
    return null;
  }

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
