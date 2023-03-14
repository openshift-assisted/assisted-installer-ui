import * as React from 'react';
import { FormikHelpers } from 'formik';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Modal,
  ModalVariant,
  Spinner,
} from '@patternfly/react-core';
import { DownloadIso, DiscoveryImageConfigForm, DiscoveryImageFormValues } from '../../../common';
import { AddHostModalProps } from './types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { EnvironmentErrors } from '../InfraEnv/EnvironmentErrors';
import { InfraEnvK8sResource } from '../../types';

type AddHostModalStepType = 'iso-config' | 'iso-download';

const AddHostModal: React.FC<AddHostModalProps> = ({
  isOpen,
  onClose,
  infraEnv,
  agentClusterInstall,
  onSaveISOParams,
  docVersion,
}) => {
  const hasDHCP = infraEnv.metadata?.labels?.networkType !== 'static';
  const sshPublicKey = infraEnv.spec?.sshAuthorizedKey || agentClusterInstall?.spec?.sshPublicKey;
  const { httpProxy, httpsProxy, noProxy } = infraEnv.spec?.proxy || {};

  const areIsoDataAvailable = !!sshPublicKey || !!httpProxy || !!httpsProxy || !!noProxy;
  const isoDialog = areIsoDataAvailable ? 'iso-download' : 'iso-config';
  const [dialogType, setDialogType] = React.useState<AddHostModalStepType>(isoDialog);
  const { t } = useTranslation();
  const handleIsoConfigSubmit = async (
    values: DiscoveryImageFormValues,
    formikActions: FormikHelpers<DiscoveryImageFormValues>,
  ) => {
    try {
      await onSaveISOParams(values);
      setDialogType('iso-download');
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
        {dialogType === 'iso-config' && (
          <DiscoveryImageConfigForm
            onCancel={onClose}
            handleSubmit={handleIsoConfigSubmit}
            hideDiscoveryImageType={true} // So far configured by env variable on backend
            imageType="full-iso" // So far the only option for CIM
            sshPublicKey={sshPublicKey}
            httpProxy={httpProxy}
            httpsProxy={httpsProxy}
            noProxy={noProxy}
            hasDHCP={hasDHCP}
          />
        )}
        {dialogType === 'iso-download' && (
          <GeneratingIsoDownload
            onClose={onClose}
            infraEnv={infraEnv}
            onReset={() => setDialogType('iso-config')}
            hasDHCP={hasDHCP}
          />
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
}: {
  infraEnv: InfraEnvK8sResource;
  onClose: VoidFunction;
  onReset: VoidFunction;
  hasDHCP: boolean;
}) => {
  const { t } = useTranslation();
  return infraEnv.status?.isoDownloadURL ? (
    <DownloadIso
      onClose={onClose}
      downloadUrl={infraEnv.status.isoDownloadURL}
      onReset={onReset}
      hasDHCP={hasDHCP}
    />
  ) : (
    <EmptyState>
      <EmptyStateIcon icon={Spinner} />
      <EmptyStateBody>{t('ai:Generating discovery ISO')}</EmptyStateBody>
    </EmptyState>
  );
};

export default AddHostModal;
