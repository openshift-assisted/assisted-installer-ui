import * as React from 'react';
import { Flex, FlexItem, Modal, ModalBoxBody, ModalVariant, Radio } from '@patternfly/react-core';
import { DownloadIso, PopoverIcon } from '../../../common';
import { BMCFormProps } from '../Agent/types';
import { BMCForm } from '../Agent';

type AddHostModalProps = Pick<BMCFormProps, 'onClose' | 'onCreate' | 'infraEnv'> & {
  isOpen: boolean;
  isBMPlatform: boolean;
};

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

const AddHostModal: React.FC<AddHostModalProps> = ({
  isOpen,
  onClose,
  infraEnv,
  onCreate,
  isBMPlatform,
}) => {
  const hasDHCP = infraEnv.metadata?.labels?.networkType !== 'static';
  const [isDiscoveryISO, setDiscoveryISO] = React.useState(hasDHCP);
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
                isChecked={isDiscoveryISO}
                onChange={setDiscoveryISO}
              />
            </FlexItem>
            <FlexItem spacer={{ default: isBMPlatform ? 'spacerXl' : 'spacerSm' }} />
            <FlexItem>
              <Radio
                id="bmc"
                name="type"
                label="Baseboard Management Controller (BMC)"
                isChecked={!isDiscoveryISO}
                onChange={(checked) => setDiscoveryISO(!checked)}
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
      {isDiscoveryISO ? (
        <DownloadIso onClose={onClose} downloadUrl={infraEnv?.status?.isoDownloadURL} />
      ) : (
        <BMCForm onCreate={onCreate} onClose={onClose} hasDHCP={hasDHCP} infraEnv={infraEnv} />
      )}
    </Modal>
  );
};

export default AddHostModal;
