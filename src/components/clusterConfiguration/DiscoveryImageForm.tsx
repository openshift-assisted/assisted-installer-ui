import React from 'react';
import * as Yup from 'yup';
import {
  Button,
  ButtonVariant,
  Form,
  TextContent,
  Text,
  ModalBoxBody,
  ModalBoxFooter,
  AlertVariant,
  Alert,
  AlertActionCloseButton,
} from '@patternfly/react-core';
import Axios, { CancelTokenSource } from 'axios';
import { InputField, TextAreaField } from '../ui/formik';
import { Formik, FormikHelpers } from 'formik';
import { createClusterDownloadsImage } from '../../api/clusters';
import { LoadingState } from '../ui/uiState';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { ImageCreateParams, ImageInfo, Cluster } from '../../api/types';
import { sshPublicKeyValidationSchema } from '../ui/formik/validationSchemas';
import GridGap from '../ui/GridGap';

const validationSchema = Yup.object().shape({
  proxyUrl: Yup.string().url('Provide a valid URL.'),
  sshPublicKey: sshPublicKeyValidationSchema.required(
    'SSH key is required for debugging the host registration.',
  ),
});

type DiscoveryImageFormProps = {
  clusterId: Cluster['id'];
  imageInfo: ImageInfo;
  onCancel: () => void;
  onSuccess: (imageInfo: Cluster['imageInfo']) => void;
};

const DiscoveryImageForm: React.FC<DiscoveryImageFormProps> = ({
  clusterId,
  imageInfo,
  onCancel,
  onSuccess,
}) => {
  const cancelSourceRef = React.useRef<CancelTokenSource>();
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
        const { data: cluster } = await createClusterDownloadsImage(clusterId, values, {
          cancelToken: cancelSourceRef.current?.token,
        });
        onSuccess(cluster.imageInfo);
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

  const initialValues = {
    proxyUrl: proxyUrl || '',
    sshPublicKey: sshPublicKey || '',
  };

  return (
    <Formik
      initialValues={initialValues as ImageCreateParams}
      initialStatus={{ error: null }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit, isSubmitting, status, setStatus }) =>
        isSubmitting ? (
          <LoadingState
            content="Discovery image is being prepared, it will be available in a moment..."
            secondaryActions={[
              <Button key="close" variant={ButtonVariant.secondary} onClick={onCancel}>
                Cancel
              </Button>,
            ]}
          />
        ) : (
          <Form onSubmit={handleSubmit}>
            <ModalBoxBody>
              <GridGap>
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
                  <Text component="p">
                    The Discovery ISO should only be booted once per host. Either adjust the boot
                    order in each host's BIOS to make it secondary after the first alpabetical disk,
                    or select the ISO once manually. All other disks in the host will be wiped
                    during the installation.
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
              </GridGap>
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button key="submit" type="submit">
                Get Discovery ISO
              </Button>
              <Button key="cancel" variant="link" onClick={onCancel}>
                Cancel
              </Button>
            </ModalBoxFooter>
          </Form>
        )
      }
    </Formik>
  );
};

export default DiscoveryImageForm;
