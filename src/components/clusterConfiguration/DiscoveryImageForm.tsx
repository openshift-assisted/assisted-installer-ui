import React from 'react';
import * as Yup from 'yup';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
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
import { TextAreaField } from '../ui/formik';
import { Formik, FormikHelpers } from 'formik';
import { createClusterDownloadsImage } from '../../api/clusters';
import { LoadingState } from '../ui/uiState';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { ImageCreateParams, ImageInfo, Cluster } from '../../api/types';
import { sshPublicKeyValidationSchema } from '../ui/formik/validationSchemas';
import GridGap from '../ui/GridGap';
import { updateCluster, forceReload } from '../../features/clusters/currentClusterSlice';
import DiscoveryProxyFields from './DiscoveryProxyFields';
import { DiscoveryImageFormValues } from './types';

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
  const dispatch = useDispatch();

  React.useEffect(() => {
    cancelSourceRef.current = Axios.CancelToken.source();
    return () => cancelSourceRef.current?.cancel('Image generation cancelled by user.');
  }, []);

  const handleCancel = () => {
    dispatch(forceReload());
    onCancel();
  };

  const handleSubmit = async (
    values: DiscoveryImageFormValues,
    formikActions: FormikHelpers<DiscoveryImageFormValues>,
  ) => {
    if (clusterId) {
      try {
        let params = _.omit(values, ['enableProxy']);

        // TODO(mlibra): Hot-fix only: to enable safe merging of https://github.com/openshift/assisted-test-infra/pull/78
        // Once merged, this will be replaced by http(s)Proxy and noProxy
        params = _.omit(values, ['proxyUrl']);

        const { data: cluster } = await createClusterDownloadsImage(clusterId, params, {
          cancelToken: cancelSourceRef.current?.token,
        });
        onSuccess(cluster.imageInfo);
        dispatch(updateCluster(cluster));
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
    enableProxy: !!proxyUrl,
    proxyUrl: proxyUrl || '',
    sshPublicKey: sshPublicKey || '',
  };

  return (
    <Formik
      initialValues={initialValues as DiscoveryImageFormValues}
      initialStatus={{ error: null }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit, isSubmitting, status, setStatus }) =>
        isSubmitting ? (
          <LoadingState
            content="Discovery image is being prepared, it will be available in a moment..."
            secondaryActions={[
              <Button key="close" variant={ButtonVariant.secondary} onClick={handleCancel}>
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
                    Each host will need a valid IP address assigned by a DHCP server with DNS
                    records that fully resolve.
                  </Text>
                  <Text component="p">
                    The Discovery ISO should only be booted once per host. Either adjust the boot
                    order in each host's BIOS to make it secondary after the first alphabetical
                    disk, or select the ISO once manually. All other disks in the host will be wiped
                    during the installation.
                  </Text>
                </TextContent>
                {/* TODO(mlibra): Hot-fix, see comment in handleSubmit() above: <DiscoveryProxyFields />*/}
                <TextAreaField
                  label="Host SSH public key for troubleshooting during discovery"
                  name="sshPublicKey"
                  helperText="Provide a public key to debug any hosts that fail to register successfuly."
                  idPostfix="discovery"
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
