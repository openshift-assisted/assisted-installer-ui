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
  httpProxyValidationSchema,
  noProxyValidationSchema,
  sshPublicKeyValidationSchema,
  LoadingState,
  ProxyFields,
  UploadSSH,
  InfraEnv,
  ErrorState,
} from '../../../common';
import { updateCluster, forceReload } from '../../reducers/clusters';
import { DiscoveryImageFormValues } from './types';
import { usePullSecret } from '../../hooks';
import DiscoveryImageTypeControlGroup from '../../../common/components/clusterConfiguration/DiscoveryImageTypeControlGroup';
import useInfraEnv from '../../hooks/useInfraEnv';
import { DiscoveryImageFormService } from '../../services';

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
  const { infraEnv, error: infraEnvError, isLoading: isLoadingInfraEnv } = useInfraEnv(cluster.id);

  const cancelSourceRef = React.useRef<CancelTokenSource>();
  const dispatch = useDispatch();
  const ocmPullSecret = usePullSecret();

  const initialValues: DiscoveryImageFormValues = DiscoveryImageFormService.getInitialValues(
    infraEnv,
  );

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
    if (cluster.id && infraEnv?.id) {
      try {
        const updatedCluster = await DiscoveryImageFormService.update(
          cluster.id,
          infraEnv.id,
          values,
          cluster.kind,
          ocmPullSecret,
        );
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

  if (isLoadingInfraEnv) {
    return <LoadingState />;
  } else if (infraEnvError) {
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
