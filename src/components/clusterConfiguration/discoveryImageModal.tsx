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
  ModalVariant,
} from '@patternfly/react-core';
import { saveAs } from 'file-saver';
import { ToolbarButton } from '../ui/Toolbar';
import { InputField, TextAreaField } from '../ui/formik';
import { Formik, FormikHelpers } from 'formik';
import { createClusterDownloadsImage, getClusterDownloadsImageUrl } from '../../api/clusters';
import { useParams } from 'react-router-dom';
import { LoadingState } from '../ui/uiState';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { ImageCreateParams, ImageInfo } from '../../api/types';
import { sshPublicKeyValidationSchema } from '../ui/formik/validationSchemas';

type DiscoveryImageModalButtonProps = {
  ButtonComponent?: typeof Button | typeof ToolbarButton;
  imageInfo: ImageInfo;
};

export const DiscoveryImageModalButton: React.FC<DiscoveryImageModalButtonProps> = ({
  ButtonComponent = Button,
  imageInfo,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <ButtonComponent variant={ButtonVariant.primary} onClick={() => setIsModalOpen(true)}>
        Download discovery ISO
      </ButtonComponent>
      {isModalOpen && <DiscoveryImageModal closeModal={closeModal} imageInfo={imageInfo} />}
    </>
  );
};

const validationSchema = Yup.object().shape({
  proxyUrl: Yup.string().url('Provide a valid URL.'),
  sshPublicKey: sshPublicKeyValidationSchema.required(
    'SSH key is required for debugging the host registration.',
  ),
});

type DiscoveryImageModalProps = {
  closeModal: () => void;
  imageInfo: ImageInfo;
};

export const DiscoveryImageModal: React.FC<DiscoveryImageModalProps> = ({
  closeModal,
  imageInfo,
}) => {
  const cancelSourceRef = React.useRef<CancelTokenSource>();
  const { clusterId } = useParams();
  const { proxyUrl, sshPublicKey } = imageInfo;

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
        await createClusterDownloadsImage(clusterId, values, {
          cancelToken: cancelSourceRef.current?.token,
        });
        saveAs(getClusterDownloadsImageUrl(clusterId), `discovery-image-${clusterId}.iso`);
        closeModal();
      } catch (error) {
        handleApiError<ImageCreateParams>(error, () => {
          formikActions.setStatus({
            error: {
              title: 'Failed to download the discovery Image',
              message: getErrorMessage(error),
            },
          });
        });
      }
    }
  };

  return (
    <Modal
      title="Download discovery ISO"
      isOpen={true}
      onClose={closeModal}
      variant={ModalVariant.small}
    >
      <Formik
        initialValues={{ proxyUrl, sshPublicKey } as ImageCreateParams}
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
                    title={status.error.title}
                    actionClose={
                      <AlertActionCloseButton onClose={() => setStatus({ error: null })} />
                    }
                    isInline
                  >
                    {status.error.message}
                  </Alert>
                )}
                <TextContent>
                  <Text component="p">
                    Hosts must be connected to the internet to form a cluster using this installer.
                    If hosts are behind a firewall that requires the use of a proxy, provide the
                    proxy URL below.
                  </Text>
                  <Text component="p">
                    Each host will need a valid IP address assigned by a DHCP server with DNS
                    records that fully resolve.
                  </Text>
                </TextContent>
                <InputField
                  label="HTTP Proxy URL"
                  name="proxyUrl"
                  placeholder="http://<user>:<password>@<ipaddr>:<port>"
                  helperText="HTTP proxy URL that agents should use to access the discovery service"
                />
                <TextAreaField
                  label="SSH public key"
                  name="sshPublicKey"
                  helperText="SSH public key for debugging the host registration/installation"
                  isRequired
                />
                <ModalBoxFooter>
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
