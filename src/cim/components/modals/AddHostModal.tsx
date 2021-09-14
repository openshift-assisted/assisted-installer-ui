import * as React from 'react';
import { Flex, FlexItem, Modal, ModalBoxBody, ModalVariant, Radio } from '@patternfly/react-core';
import { DownloadIso } from '../../../common';
import { BMCFormProps } from '../Agent/types';
import { BMCForm } from '../Agent';

type AddHostModalProps = Pick<BMCFormProps, 'onClose' | 'onCreate' | 'infraEnv'> & {
  isOpen: boolean;
};

const AddHostModal: React.FC<AddHostModalProps> = ({ isOpen, onClose, infraEnv, onCreate }) => {
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
          <Flex justifyContent={{ default: 'justifyContentFlexStart' }}>
            <FlexItem>
              <Radio
                id="iso"
                name="type"
                label="Discovery ISO"
                isChecked={isDiscoveryISO}
                onChange={setDiscoveryISO}
              />
            </FlexItem>
            <FlexItem spacer={{ default: 'spacerXl' }} />
            <FlexItem>
              <Radio
                id="bmc"
                name="type"
                label="Baseboard Management Controller (BMC)"
                isChecked={!isDiscoveryISO}
                onChange={(checked) => setDiscoveryISO(!checked)}
              />
            </FlexItem>
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
