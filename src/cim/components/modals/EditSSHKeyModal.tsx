import * as React from 'react';
import * as Yup from 'yup';
import {
  Alert,
  Button,
  ButtonVariant,
  Modal,
  ModalBoxBody,
  ModalBoxFooter,
  ModalVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Formik, FormikProps } from 'formik';

import { InfraEnvK8sResource } from '../../types';
import { UploadSSH, sshPublicKeyValidationSchema } from '../../../common';
import { EditSSHKeyFormikValues } from './types';
import { getWarningMessage } from './utils';

const validationSchema = Yup.object({
  sshPublicKey: sshPublicKeyValidationSchema.required(
    'An SSH key is required to debug hosts as they register.',
  ),
});

export type EditSSHKeyModalProps = {
  isOpen: boolean;
  onClose: VoidFunction;
  // eslint-disable-next-line
  onSubmit: (values: EditSSHKeyFormikValues, infraEnv: InfraEnvK8sResource) => Promise<any>;
  infraEnv: InfraEnvK8sResource;
  hasAgents: boolean;
  hasBMHs: boolean;
};

const EditSSHKeyModal: React.FC<EditSSHKeyModalProps> = ({
  isOpen,
  onClose,
  infraEnv,
  onSubmit,
  hasAgents,
  hasBMHs,
}) => {
  const [error, setError] = React.useState<string | undefined>();
  const warningMsg = getWarningMessage(hasAgents, hasBMHs);
  return (
    <Modal
      aria-label="Edit SSH public key dialog"
      title="Edi SSH public key"
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      id="edit-ssh-key-modal"
    >
      <Formik<EditSSHKeyFormikValues>
        initialValues={{
          sshPublicKey: infraEnv.spec?.sshAuthorizedKey || '',
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          try {
            await onSubmit(values, infraEnv);
            onClose();
          } catch (err) {
            setError(err?.message || 'An error occured');
          }
        }}
        validateOnMount
      >
        {({ isSubmitting, isValid, submitForm }: FormikProps<EditSSHKeyModalProps>) => (
          <>
            <ModalBoxBody>
              <Stack hasGutter>
                <StackItem>
                  <Alert isInline variant="warning" title={warningMsg} />
                </StackItem>
                <StackItem>
                  <UploadSSH />
                </StackItem>
                {error && (
                  <StackItem>
                    <Alert title={error} variant="danger" isInline />
                  </StackItem>
                )}
              </Stack>
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button onClick={submitForm} isDisabled={isSubmitting || !isValid}>
                Save SSH public key
              </Button>
              <Button onClick={onClose} variant={ButtonVariant.secondary}>
                Cancel
              </Button>
            </ModalBoxFooter>
          </>
        )}
      </Formik>
    </Modal>
  );
};

export default EditSSHKeyModal;
