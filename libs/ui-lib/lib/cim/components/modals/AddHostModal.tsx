import * as React from 'react';
import { FormikHelpers } from 'formik';
import {
  EmptyState,
  EmptyStateBody,
  Modal,
  ModalBody,
  ModalHeader,
  ModalVariant,
  Spinner,
} from '@patternfly/react-core';
import { DownloadIso, DiscoveryImageConfigForm, DiscoveryImageFormValues } from '../../../common';
import { AddHostModalProps } from './types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { EnvironmentErrors } from '../InfraEnv/EnvironmentErrors';
import { InfraEnvK8sResource } from '../../types';
import DownloadIpxeScript from '../../../common/components/clusterConfiguration/DownloadIpxeScript';
import { useAgentServiceConfig } from '../../hooks';

type AddHostModalStepType = 'config' | 'download';

const AddHostModal: React.FC<AddHostModalProps> = ({
  isOpen,
  onClose,
  infraEnv,
  agentClusterInstall,
  onSaveISOParams,
  docVersion,
  isIPXE,
}) => {
  const { t } = useTranslation();
  const hasDHCP = infraEnv.metadata?.labels?.networkType !== 'static';
  const sshPublicKey = infraEnv.spec?.sshAuthorizedKey || agentClusterInstall?.spec?.sshPublicKey;
  const { httpProxy, httpsProxy, noProxy } = infraEnv.spec?.proxy || {};
  const imageType = infraEnv.spec?.imageType || 'minimal-iso';
  const [dialogType, setDialogType] = React.useState<AddHostModalStepType>('config');
  const [agentServiceConfig, loaded, error] = useAgentServiceConfig({ name: 'agent' });

  const ciscoUrl =
    loaded && !error
      ? agentServiceConfig?.metadata?.annotations?.['ciscoIntersightURL']
      : undefined;

  const handleIsoConfigSubmit = async (
    values: DiscoveryImageFormValues,
    formikActions: FormikHelpers<DiscoveryImageFormValues>,
  ) => {
    try {
      await onSaveISOParams(values);
      setDialogType('download');
    } catch (error) {
      formikActions.setStatus({
        error: {
          title: t('ai:Failed to download the discovery Image'),
          message: error as string, // TODO(mlibra): parse it better!!
        },
      });
    }
  };

  return (
    <Modal
      aria-label={t('ai:Add host dialog')}
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      id="add-host-modal"
    >
      <ModalHeader title={t('ai:Add hosts')} />
      <EnvironmentErrors infraEnv={infraEnv} docVersion={docVersion}>
        {dialogType === 'config' && (
          <DiscoveryImageConfigForm
            onCancel={onClose}
            handleSubmit={handleIsoConfigSubmit}
            hideDiscoveryImageType={isIPXE}
            imageType={imageType}
            sshPublicKey={sshPublicKey}
            httpProxy={httpProxy}
            httpsProxy={httpsProxy}
            noProxy={noProxy}
            hasDHCP={hasDHCP}
            isIPXE={isIPXE}
            allowEmpty
            docVersion={docVersion}
          />
        )}

        {dialogType === 'download' && (
          <>
            {isIPXE ? (
              <GeneratingIPXEDownload
                onClose={onClose}
                infraEnv={infraEnv}
                onReset={agentClusterInstall ? () => setDialogType('config') : undefined}
              />
            ) : (
              <GeneratingIsoDownload
                onClose={onClose}
                infraEnv={infraEnv}
                onReset={agentClusterInstall ? () => setDialogType('config') : undefined}
                hasDHCP={hasDHCP}
                docVersion={docVersion}
                ciscoUrl={ciscoUrl}
              />
            )}
          </>
        )}
      </EnvironmentErrors>
    </Modal>
  );
};

const GeneratingIsoDownload = ({
  infraEnv,
  onClose,
  onReset,
  hasDHCP,
  docVersion,
  ciscoUrl,
}: {
  infraEnv: InfraEnvK8sResource;
  onClose: VoidFunction;
  onReset?: VoidFunction;
  hasDHCP: boolean;
  docVersion: string;
  ciscoUrl?: string;
}) => {
  const { t } = useTranslation();
  return infraEnv.status?.isoDownloadURL ? (
    <DownloadIso
      onClose={onClose}
      downloadUrl={infraEnv.status.isoDownloadURL}
      onReset={onReset}
      hasDHCP={hasDHCP}
      docVersion={docVersion}
      ciscoUrl={ciscoUrl}
    />
  ) : (
    <ModalBody>
      <EmptyState icon={Spinner}>
        <EmptyStateBody>{t('ai:Generating discovery ISO')}</EmptyStateBody>
      </EmptyState>
    </ModalBody>
  );
};

const GeneratingIPXEDownload = ({
  infraEnv,
  onClose,
  onReset,
}: {
  infraEnv: InfraEnvK8sResource;
  onClose: VoidFunction;
  onReset?: VoidFunction;
}) => {
  const { t } = useTranslation();
  return infraEnv.status?.bootArtifacts?.ipxeScript ? (
    <DownloadIpxeScript
      onClose={onClose}
      downloadUrl={infraEnv.status.bootArtifacts.ipxeScript}
      onReset={onReset}
    />
  ) : (
    <ModalBody>
      <EmptyState icon={Spinner}>
        <EmptyStateBody>{t('ai:Generating iPXE script')}</EmptyStateBody>
      </EmptyState>
    </ModalBody>
  );
};

export default AddHostModal;
