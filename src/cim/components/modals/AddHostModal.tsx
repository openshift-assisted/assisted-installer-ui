import * as React from 'react';
import { FormikHelpers } from 'formik';
import { Modal, ModalVariant } from '@patternfly/react-core';
import { DownloadIso, DiscoveryImageConfigForm, DiscoveryImageFormValues } from '../../../common';
import BMCForm from '../Agent/BMCForm';
import { AddHostModalProps } from './types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

type AddHostModalStepType = 'bmc' | 'iso-config' | 'iso-download';

const AddHostModal: React.FC<AddHostModalProps> = ({
  isOpen,
  onClose,
  infraEnv,
  agentClusterInstall,
  onCreateBMH,
  onSaveISOParams,
  usedHostnames,
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
          message: error, // TODO(mlibra): parse it better!!
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
        <DownloadIso
          onClose={onClose}
          downloadUrl={infraEnv?.status?.isoDownloadURL}
          onReset={() => setDialogType('iso-config')}
          hasDHCP={hasDHCP}
        />
      )}
      {dialogType === 'bmc' && (
        <BMCForm
          onCreateBMH={onCreateBMH}
          onClose={onClose}
          hasDHCP={hasDHCP}
          infraEnv={infraEnv}
          usedHostnames={usedHostnames}
        />
      )}
    </Modal>
  );
};

export default AddHostModal;
