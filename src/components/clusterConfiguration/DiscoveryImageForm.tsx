import React from 'react';
import * as Yup from 'yup';
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
  TextVariants,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { ConnectedIcon, HddIcon, IconSize } from '@patternfly/react-icons';
import Axios, { CancelTokenSource } from 'axios';
import { UploadField } from '../ui/formik';
import { Formik, FormikHelpers } from 'formik';
import { createClusterDownloadsImage, patchCluster } from '../../api/clusters';
import { LoadingState } from '../ui/uiState';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { ImageCreateParams, Cluster, ClusterUpdateParams } from '../../api/types';
import {
  sshPublicKeyValidationSchema,
  httpProxyValidationSchema,
  noProxyValidationSchema,
} from '../ui/formik/validationSchemas';
import { updateCluster, forceReload } from '../../features/clusters/currentClusterSlice';
import { DiscoveryImageFormValues } from './types';
import ProxyFields from './ProxyFields';

import './discoveryImageModal.css';

type BootOrderProps = {
  order: number;
  Icon: typeof HddIcon;
  title: string;
  description: string;
};

const BootOrder: React.FC<BootOrderProps> = ({ order, Icon, title, description }) => (
  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
    <FlexItem>
      <Text className="boot-order__order" component={TextVariants.small}>
        #{order}
      </Text>
    </FlexItem>
    <FlexItem>
      <Icon size={IconSize.xl} />
    </FlexItem>
    <FlexItem>
      <Text className="boot-order__title" component={TextVariants.h6}>
        {title}
      </Text>
      <Text component={TextVariants.small}>{description}</Text>
    </FlexItem>
  </Flex>
);

const validationSchema = Yup.lazy<DiscoveryImageFormValues>((values) =>
  Yup.object<DiscoveryImageFormValues>().shape({
    sshPublicKey: sshPublicKeyValidationSchema.required(
      'SSH key is required for debugging the host registration.',
    ),
    httpProxy: httpProxyValidationSchema(values, 'httpsProxy'),
    httpsProxy: httpProxyValidationSchema(values, 'httpProxy'), // share the schema, httpS is currently not supported
    noProxy: noProxyValidationSchema,
  }),
);

type DiscoveryImageFormProps = {
  cluster: Cluster;
  onCancel: () => void;
  onSuccess: (imageInfo: Cluster['imageInfo']) => void;
};

const DiscoveryImageForm: React.FC<DiscoveryImageFormProps> = ({
  cluster,
  onCancel,
  onSuccess,
}) => {
  const cancelSourceRef = React.useRef<CancelTokenSource>();
  const { sshPublicKey } = cluster.imageInfo;
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
    if (cluster.id) {
      try {
        const proxyParams: ClusterUpdateParams = {
          httpProxy: values.httpProxy,
          httpsProxy: values.httpsProxy,
          noProxy: values.noProxy,
        };
        // either update or remove proxy details
        await patchCluster(cluster.id, proxyParams);

        const imageCreateParams: ImageCreateParams = {
          sshPublicKey: values.sshPublicKey,
        };
        const { data: updatedCluster } = await createClusterDownloadsImage(
          cluster.id,
          imageCreateParams,
          {
            cancelToken: cancelSourceRef.current?.token,
          },
        );
        onSuccess(updatedCluster.imageInfo);
        dispatch(updateCluster(updatedCluster));
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
    sshPublicKey: sshPublicKey || '',
    httpProxy: cluster.httpProxy || '',
    httpsProxy: cluster.httpsProxy || '',
    noProxy: cluster.noProxy || '',
    enableProxy: !!(cluster.httpProxy || cluster.httpsProxy || cluster.noProxy),
  };

  return (
    <Formik
      initialValues={initialValues as DiscoveryImageFormValues}
      initialStatus={{ error: null }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, status, setStatus, setFieldValue, values }) => {
        const onSshKeyBlur = () => {
          if (values.sshPublicKey) {
            setFieldValue('sshPublicKey', values.sshPublicKey.trim());
          }
        };

        return isSubmitting ? (
          <LoadingState
            content="Discovery image is being prepared, it will be available in a moment..."
            secondaryActions={[
              <Button key="close" variant={ButtonVariant.secondary} onClick={handleCancel}>
                Cancel
              </Button>,
            ]}
          />
        ) : (
          <>
            <ModalBoxBody>
              <Form>
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
                    Each host will need a valid IP address assigned by DHCP server with DNS records
                    that fully resolve.
                  </Text>
                  <Text className="boot-order__title" component={TextVariants.h3}>
                    Boot Order Sequence
                  </Text>
                  <Text component={TextVariants.small}>
                    Please configure each host's BIOS to boot in this sequence:
                  </Text>
                </TextContent>
                <TextContent>
                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                    <BootOrder
                      order={1}
                      Icon={HddIcon}
                      title="Empty hard drive"
                      description="OpenShift will be installed on this drive. Any data will be erased."
                    />
                    <BootOrder
                      order={2}
                      Icon={ConnectedIcon}
                      title="Discovery ISO"
                      description="Boot only once. Hardware must be connected to internet."
                    />
                  </Flex>
                </TextContent>
                <UploadField
                  label="SSH public key"
                  name="sshPublicKey"
                  helperText="SSH key used to debug OpenShift nodes. Generate a new key using ssh-keygen -o and upload or paste the value of ~/.ssh/id_rsa.pub here."
                  idPostfix="discovery"
                  isRequired
                  onBlur={onSshKeyBlur}
                />
                <ProxyFields />
              </Form>
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button key="submit" onClick={submitForm}>
                Generate Discovery ISO
              </Button>
              <Button key="cancel" variant="link" onClick={onCancel}>
                Cancel
              </Button>
            </ModalBoxFooter>
          </>
        );
      }}
    </Formik>
  );
};

export default DiscoveryImageForm;
