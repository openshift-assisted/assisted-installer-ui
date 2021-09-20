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
import { Formik, FormikHelpers } from 'formik';
import { createClusterDownloadsImage, patchCluster } from '../../api';
import { handleApiError, getErrorMessage } from '../../api';
import {
  ImageCreateParams,
  Cluster,
  ClusterUpdateParams,
  httpProxyValidationSchema,
  noProxyValidationSchema,
  sshPublicKeyValidationSchema,
  LoadingState,
  ProxyFields,
  UploadSSH,
  InfraEnv,
  InfraEnvUpdateParams,
} from '../../../common';
import { updateCluster, forceReload } from '../../reducers/clusters';
import { DiscoveryImageFormValues } from './types';
import { usePullSecretFetch } from '../fetching/pullSecret';
import DiscoveryImageTypeControlGroup from '../../../common/components/clusterConfiguration/DiscoveryImageTypeControlGroup';
import LocalStorageBackedCache from '../../adapters/LocalStorageBackedCache';
import { getInfraEnv, patchInfraEnv } from '../../api/InfraEnvService';

const validationSchema = Yup.lazy<DiscoveryImageFormValues>((values) =>
  Yup.object<DiscoveryImageFormValues>().shape({
    sshPublicKey: sshPublicKeyValidationSchema,
    httpProxy: httpProxyValidationSchema(values, 'httpsProxy'),
    httpsProxy: httpProxyValidationSchema(values, 'httpProxy'), // share the schema, httpS is currently not supported
    noProxy: noProxyValidationSchema,
  }),
);

type DiscoveryImageFormProps = {
  cluster: Cluster;
  onCancel: () => void;
  onSuccess: (downloadUrl: InfraEnv['downloadUrl']) => void;
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
        const infraEnvId = LocalStorageBackedCache.getItem(cluster.id);
        if (infraEnvId === null) {
          return;
        }

        const proxyParams: ClusterUpdateParams = {
          httpProxy: values.httpProxy,
          httpsProxy: values.httpsProxy,
          noProxy: values.noProxy,
          // TODO(mlibra): Does the user need to change pull-secret?
          pullSecret:
            cluster.kind === 'AddHostsCluster' && ocmPullSecret ? ocmPullSecret : undefined,
          sshPublicKey: values.sshPublicKey,
        };

        const infraParams: InfraEnvUpdateParams = {
          proxy: {
            httpProxy: values.httpProxy,
            httpsProxy: values.httpsProxy,
            noProxy: values.noProxy,
          },
          imageType: values.imageType,
        };

        // either update or remove proxy details
        const { data: updatedCluster } = await patchCluster(cluster.id, proxyParams);
        const { data: infraEnv } = await patchInfraEnv(infraEnvId, infraParams);

        console.log(infraEnv);

        onSuccess(infraEnv.downloadUrl);
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

  const initialValues: DiscoveryImageFormValues = {
    sshPublicKey: sshPublicKey || '',
    httpProxy: cluster.httpProxy || '',
    httpsProxy: cluster.httpsProxy || '',
    noProxy: cluster.noProxy || '',
    enableProxy: !!(cluster.httpProxy || cluster.httpsProxy || cluster.noProxy),
    imageType: cluster.imageInfo.type || 'full-iso',
  };

  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, status, setStatus }) => {
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
                <DiscoveryImageTypeControlGroup />
                <UploadSSH />
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
