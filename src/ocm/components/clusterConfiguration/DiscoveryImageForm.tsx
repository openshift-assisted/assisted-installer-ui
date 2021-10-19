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
import { handleApiError, getErrorMessage } from '../../api';
import {
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
  ErrorState,
} from '../../../common';
import { updateCluster, forceReload } from '../../reducers/clusters';
import { DiscoveryImageFormValues } from './types';
import { usePullSecretFetch } from '../fetching/pullSecret';
import DiscoveryImageTypeControlGroup from '../../../common/components/clusterConfiguration/DiscoveryImageTypeControlGroup';
import { ClustersAPI, InfraEnvsAPI } from '../../services/apis';
import { useInfraEnvId } from '../../hooks';
import useInfraEnv from '../../hooks/useInfraEnv';
import { InfraEnvsService } from '../../services';

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
  onSuccess: (imageInfo: InfraEnv['downloadUrl']) => void;
};

const DiscoveryImageForm: React.FC<DiscoveryImageFormProps> = ({
  cluster,
  onCancel,
  onSuccess,
}) => {
  const { infraEnv, infraEnvId, error, isLoadingInfraEnv } = useInfraEnv(cluster.id);

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

        const { data: updatedCluster } = await ClustersAPI.update(cluster.id, proxyParams);
        if (infraEnv.id) {
          const infraEnvParams: InfraEnvUpdateParams = {
            proxy: {
              httpProxy: values.httpProxy,
              httpsProxy: values.httpsProxy,
              noProxy: values.noProxy,
            },
            sshAuthorizedKey: values.sshPublicKey,
            pullSecret:
              cluster.kind === 'AddHostsCluster' && ocmPullSecret ? ocmPullSecret : undefined,
            staticNetworkConfig: values.staticNetworkConfig,
            imageType: values.imageType,
          };
          await InfraEnvsAPI.patch(infraEnvId, infraEnvParams);
        }

        onSuccess(infraEnv?.downloadUrl);
        dispatch(updateCluster(updatedCluster));
      } catch (error) {
        handleApiError(error, () => {
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
    imageType: infraEnv?.type || 'full-iso',
  };

  if (isLoadingInfraEnv) {
    return <LoadingState />;
  } else if (error) {
    //TODO: configure error state
    return <ErrorState />;
  } else {
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
  }
};

export default DiscoveryImageForm;
