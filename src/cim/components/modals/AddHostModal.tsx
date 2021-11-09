import * as React from 'react';
import { FormikHelpers } from 'formik';
import { Flex, FlexItem, Modal, ModalBoxBody, ModalVariant, Radio } from '@patternfly/react-core';
import {
  DownloadIso,
  PopoverIcon,
  DiscoveryImageConfigForm,
  DiscoveryImageFormValues,
} from '../../../common';
import { BMCForm } from '../Agent';
import { AddHostModalProps } from './types';

// TODO(mlibra): This limitation needs to be updated once https://github.com/openshift/enhancements/pull/871 lands.
const BmOnBmOnlyPopoverIcon = () => (
  <PopoverIcon
    noVerticalAlign
    bodyContent={
      <>
        The Advanced Cluster Manager can manage bare metal hosts when deployed on bare metal
        platform only.
      </>
    }
  />
);

type AddHostModalStepType = 'bmc' | 'iso-config' | 'iso-download';

const AddHostModal: React.FC<AddHostModalProps> = ({
  isOpen,
  onClose,
  infraEnv,
  onCreateBMH,
  onSaveISOParams,
  isBMPlatform,
}) => {
  const hasDHCP = infraEnv.metadata?.labels?.networkType !== 'static';
  const sshPublicKey = infraEnv.spec?.sshAuthorizedKey;
  const { httpProxy, httpsProxy, noProxy } = infraEnv.spec?.proxy || {};

  const areIsoDataAvailable = !!sshPublicKey || !!httpProxy || !!httpsProxy || !!noProxy;
  const [dialogType, setDialogType] = React.useState<AddHostModalStepType>(
    hasDHCP ? (areIsoDataAvailable ? 'iso-download' : 'iso-config') : 'bmc',
  );

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
      title="Add Host"
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      id="add-host-modal"
    >
      {hasDHCP && (
        <ModalBoxBody>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <FlexItem>
              <Radio
                id="iso"
                name="type"
                label="Discovery ISO"
                isChecked={dialogType !== 'bmc'}
                onChange={(checked) => setDialogType(checked ? 'iso-config' : 'bmc')}
              />
            </FlexItem>
            <FlexItem spacer={{ default: isBMPlatform ? 'spacerXl' : 'spacerSm' }} />
            <FlexItem>
              <Radio
                id="bmc"
                name="type"
                label="Baseboard Management Controller (BMC)"
                isChecked={!dialogType}
                onChange={(checked) => setDialogType(checked ? 'bmc' : 'iso-config')}
                isDisabled={!isBMPlatform}
              />
            </FlexItem>
            {!isBMPlatform && (
              <FlexItem>
                <BmOnBmOnlyPopoverIcon />
              </FlexItem>
            )}
          </Flex>
        </ModalBoxBody>
      )}
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
        />
      )}
      {dialogType === 'iso-download' && (
        <DownloadIso
          onClose={onClose}
          downloadUrl={infraEnv?.status?.isoDownloadURL}
          onReset={() => setDialogType('iso-config')}
        />
      )}
      {dialogType === 'bmc' && (
        <BMCForm
          onCreateBMH={onCreateBMH}
          onClose={onClose}
          hasDHCP={hasDHCP}
          infraEnv={infraEnv}
        />
      )}
    </Modal>
  );
};

export default AddHostModal;
