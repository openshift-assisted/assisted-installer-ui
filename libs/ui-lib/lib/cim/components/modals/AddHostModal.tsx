import * as React from 'react';
import { FormikHelpers } from 'formik';
import {
	EmptyState,
	EmptyStateBody,
	Spinner
} from '@patternfly/react-core';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import { DownloadIso, DiscoveryImageConfigForm, DiscoveryImageFormValues } from '../../../common';
import { AddHostModalProps } from './types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { EnvironmentErrors } from '../InfraEnv/EnvironmentErrors';
import { InfraEnvK8sResource } from '../../types';
import DownloadIpxeScript from '../../../common/components/clusterConfiguration/DownloadIpxeScript';

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
  const hasDHCP = infraEnv.metadata?.labels?.networkType !== 'static';
  const sshPublicKey = infraEnv.spec?.sshAuthorizedKey || agentClusterInstall?.spec?.sshPublicKey;
  const { httpProxy, httpsProxy, noProxy } = infraEnv.spec?.proxy || {};
  const imageType = infraEnv.spec?.imageType || 'minimal-iso';
  const [dialogType, setDialogType] = React.useState<AddHostModalStepType>('config');
  const { t } = useTranslation();
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
      title={t('ai:Add host')}
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      id="add-host-modal"
    >
      <EnvironmentErrors infraEnv={infraEnv} docVersion={docVersion} inModal>
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
}: {
  infraEnv: InfraEnvK8sResource;
  onClose: VoidFunction;
  onReset?: VoidFunction;
  hasDHCP: boolean;
  docVersion: string;
}) => {
  const { t } = useTranslation();
  return infraEnv.status?.isoDownloadURL ? (
    <DownloadIso
      onClose={onClose}
      downloadUrl={infraEnv.status.isoDownloadURL}
      onReset={onReset}
      hasDHCP={hasDHCP}
      docVersion={docVersion}
    />
  ) : (
    <EmptyState   icon={Spinner}  >
      <EmptyStateBody>{t('ai:Generating discovery ISO')}</EmptyStateBody>
    </EmptyState>
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
    <EmptyState   icon={Spinner}  >
      <EmptyStateBody>{t('ai:Generating iPXE script')}</EmptyStateBody>
    </EmptyState>
  );
};

export default AddHostModal;
