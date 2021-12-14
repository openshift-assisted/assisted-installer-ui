import * as React from 'react';
import { FormikHelpers } from 'formik';
import {
  Flex,
  FlexItem,
  Modal,
  ModalBoxHeader,
  ModalVariant,
  Radio,
  Tooltip,
} from '@patternfly/react-core';
import { DownloadIso, DiscoveryImageConfigForm, DiscoveryImageFormValues } from '../../../common';
import { BMCForm } from '../Agent';
import { AddHostModalProps } from './types';

type AddHostModalStepType = 'bmc' | 'iso-config' | 'iso-download';

const AddHostModal: React.FC<AddHostModalProps> = ({
  isOpen,
  onClose,
  infraEnv,
  agentClusterInstall,
  onCreateBMH,
  onSaveISOParams,
  isBMPlatform,
  usedHostnames,
}) => {
  const hasDHCP = infraEnv.metadata?.labels?.networkType !== 'static';
  const sshPublicKey = infraEnv.spec?.sshAuthorizedKey || agentClusterInstall?.spec?.sshPublicKey;
  const { httpProxy, httpsProxy, noProxy } = infraEnv.spec?.proxy || {};

  const areIsoDataAvailable = !!sshPublicKey || !!httpProxy || !!httpsProxy || !!noProxy;
  const isoDialog = areIsoDataAvailable ? 'iso-download' : 'iso-config';
  const [dialogType, setDialogType] = React.useState<AddHostModalStepType>(isoDialog);

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
          title: 'Failed to download the discovery Image',
          message: error, // TODO(mlibra): parse it better!!
        },
      });
    }
  };

  return (
    <Modal
      aria-label="Add host dialog"
      title="Add host"
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      id="add-host-modal"
    >
      <ModalBoxHeader>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Radio
              id="iso"
              name="type"
              label="Discovery ISO"
              isChecked={dialogType !== 'bmc'}
              onChange={(checked) => setDialogType(checked ? isoDialog : 'bmc')}
            />
          </FlexItem>
          <FlexItem spacer={{ default: isBMPlatform ? 'spacerXl' : 'spacerSm' }} />
          <FlexItem>
            <Tooltip
              hidden={isBMPlatform}
              // TODO(mlibra): This limitation needs to be updated once https://github.com/openshift/enhancements/pull/871 lands.
              content="The Advanced Cluster Manager can manage bare metal hosts when deployed on bare metal platform only."
            >
              <Radio
                id="bmc"
                name="type"
                label="Baseboard Management Controller (BMC)"
                isChecked={dialogType === 'bmc'}
                onChange={(checked) => setDialogType(checked ? 'bmc' : isoDialog)}
                isDisabled={!isBMPlatform}
              />
            </Tooltip>
          </FlexItem>
        </Flex>
      </ModalBoxHeader>
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
