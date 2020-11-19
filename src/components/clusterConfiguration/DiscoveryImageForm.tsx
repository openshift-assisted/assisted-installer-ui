import React from 'react';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import {
  Button,
  ButtonVariant,
  Form,
  ModalBoxBody,
  ModalBoxFooter,
  AlertVariant,
  Alert,
  AlertActionCloseButton,
} from '@patternfly/react-core';
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
import { SshPublicKeyHelperText } from './ClusterSshKeyField';
import { usePullSecretFetch } from '../fetching/pullSecret';
import { trimSshPublicKey } from '../ui/formik/utils';

const validationSchema = Yup.lazy<DiscoveryImageFormValues>((values) =>
  Yup.object<DiscoveryImageFormValues>().shape({
    sshPublicKey: sshPublicKeyValidationSchema.required(
      'An SSH key is required to debug hosts as they register.',
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
  const ocmPullSecret = usePullSecretFetch();

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
          // TODO(mlibra): Does the user need to change pull-secret?
          pullSecret:
            cluster.kind === 'AddHostsCluster' && ocmPullSecret ? ocmPullSecret : undefined,
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
            setFieldValue('sshPublicKey', trimSshPublicKey(values.sshPublicKey));
          }
        };

        return isSubmitting ? (
          <LoadingState
            content="Discovery image is being prepared, this might take a few seconds."
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
                <UploadField
                  label="SSH public key"
                  name="sshPublicKey"
                  helperText={<SshPublicKeyHelperText />}
                  idPostfix="discovery"
                  onBlur={onSshKeyBlur}
                  dropzoneProps={{
                    accept: '.pub',
                    maxSize: 2048,
                    onDropRejected: ({ setError }) => () => setError('File not supported.'),
                  }}
                  isRequired
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
