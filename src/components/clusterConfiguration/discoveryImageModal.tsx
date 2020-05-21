import React from 'react';
import Axios, { CancelTokenSource } from 'axios';
import * as Yup from 'yup';
import {
  Modal,
  Button,
  ButtonVariant,
  Form,
  TextContent,
  Text,
  ModalBoxFooter,
  AlertVariant,
  Alert,
  AlertActionCloseButton,
} from '@patternfly/react-core';
import { saveAs } from 'file-saver';
import { ToolbarButton } from '../ui/Toolbar';
import { InputField, TextAreaField } from '../ui/formik';
import { Formik, FormikHelpers } from 'formik';
import { createClusterDownloadsImage, getClusterDownloadsImageUrl } from '../../api/clusters';
import { useParams } from 'react-router-dom';
import { LoadingState } from '../ui/uiState';
import { handleApiError } from '../../api/utils';
import { ImageCreateParams } from '../../api/types';
import { sshPublicKeyValidationSchema } from '../ui/formik/validationSchemas';

type DiscoveryImageModalButtonProps = {
  ButtonComponent?: typeof Button | typeof ToolbarButton;
};

export const DiscoveryImageModalButton: React.FC<DiscoveryImageModalButtonProps> = ({
  ButtonComponent = Button,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <ButtonComponent variant={ButtonVariant.primary} onClick={() => setIsModalOpen(true)}>
        Download discovery ISO
      </ButtonComponent>
      {isModalOpen && <DiscoveryImageModal closeModal={closeModal} />}
    </>
  );
};

const validationSchema = Yup.object().shape({
  proxyURL: Yup.string().url('Provide a valid URL.'),
  sshPublicKey: sshPublicKeyValidationSchema,
});

type DiscoveryImageModalProps = {
  closeModal: () => void;
};

export const DiscoveryImageModal: React.FC<DiscoveryImageModalProps> = ({ closeModal }) => {
  const cancelSourceRef = React.useRef<CancelTokenSource>();
  const { clusterId } = useParams();

  React.useEffect(() => {
    cancelSourceRef.current = Axios.CancelToken.source();
    return () => cancelSourceRef.current?.cancel('Image generation cancelled by user.');
  }, []);

  const handleSubmit = async (
    values: ImageCreateParams,
    formikActions: FormikHelpers<ImageCreateParams>,
  ) => {
    if (clusterId) {
      try {
        const {
          data: { imageId },
        } = await createClusterDownloadsImage(clusterId, values, {
          cancelToken: cancelSourceRef.current?.token,
        });
        saveAs(getClusterDownloadsImageUrl(clusterId, imageId), `discovery-image-${clusterId}.iso`);
        closeModal();
      } catch (error) {
        handleApiError<ImageCreateParams>(error, () => {
          formikActions.setStatus({ error: 'Failed to download the discovery Image' });
        });
      }
    }
  };

  return (
    <Modal
      title="Download discovery ISO"
      isOpen={true}
      onClose={closeModal}
      isFooterLeftAligned
      isSmall
    >
      <Formik
        initialValues={{ proxyURL: '', sshPublicKey: '' } as ImageCreateParams}
        initialStatus={{ error: null }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, isSubmitting, status, setStatus }) => (
          <Form onSubmit={handleSubmit}>
            {isSubmitting ? (
              <LoadingState
                content="Discovery image is being prepared, the download will start in a moment."
                secondaryActions={[
                  <Button key="close" variant={ButtonVariant.secondary} onClick={closeModal}>
                    Cancel
                  </Button>,
                ]}
              />
            ) : (
              <>
                {status.error && (
                  <Alert
                    variant={AlertVariant.danger}
                    title={status.error}
                    action={<AlertActionCloseButton onClose={() => setStatus({ error: null })} />}
                    isInline
                  />
                )}
                <TextContent>
                  <Text component="small">
                    Hosts must be connected to the internet to form a cluster using this installer.
                    If hosts are behind a firewall that requires use of a proxy, provide proxy URL
                    below.
                  </Text>
                  <Text component="small">
                    Each host will need a valid IP address assigned by a DHCP server with DNS
                    records that fully resolve.
                  </Text>
                </TextContent>
                <InputField
                  label="HTTP Proxy URL"
                  name="proxyURL"
                  placeholder="http://<user>:<password>@<ipaddr>:<port>"
                  helperText="HTTP proxy URL that agents should use to access the discovery service"
                />
                <TextAreaField
                  label="SSH public key"
                  name="sshPublicKey"
                  helperText="SSH public key for debugging the installation"
                />
                <ModalBoxFooter isLeftAligned>
                  <Button key="submit" type="submit">
                    Download Discovery ISO
                  </Button>
                  <Button key="cancel" variant="link" onClick={closeModal}>
                    Cancel
                  </Button>
                </ModalBoxFooter>
              </>
            )}
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
