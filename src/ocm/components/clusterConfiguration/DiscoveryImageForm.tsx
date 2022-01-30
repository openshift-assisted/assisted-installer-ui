import React from 'react';
import { useDispatch } from 'react-redux';
import Axios, { CancelTokenSource } from 'axios';
import { FormikHelpers } from 'formik';
import { handleApiError, getErrorMessage } from '../../api';
import {
  Cluster,
  DiscoveryImageConfigForm,
  DiscoveryImageFormValues,
  ErrorState,
  InfraEnv,
  LoadingState,
} from '../../../common';
import { updateCluster, forceReload } from '../../reducers/clusters';
import { usePullSecret } from '../../hooks';
import useInfraEnv from '../../hooks/useInfraEnv';
import { DiscoveryImageFormService } from '../../services';

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
  const { infraEnv, error: infraEnvError, isLoading } = useInfraEnv(cluster.id);
  const cancelSourceRef = React.useRef<CancelTokenSource>();
  const dispatch = useDispatch();
  const ocmPullSecret = usePullSecret();

  React.useEffect(() => {
    cancelSourceRef.current = Axios.CancelToken.source();
    return () => cancelSourceRef.current?.cancel('Image generation cancelled by user.');
  }, []);

  const handleCancel = () => {
    dispatch(forceReload());
    onCancel();
  };

  const handleSubmit = async (
    formValues: DiscoveryImageFormValues,
    formikActions: FormikHelpers<DiscoveryImageFormValues>,
  ) => {
    if (cluster.id && infraEnv?.id) {
      try {
        const { updatedCluster, downloadUrl } = await DiscoveryImageFormService.update(
          cluster.id,
          infraEnv.id,
          cluster.kind,
          formValues,
          ocmPullSecret,
        );
        onSuccess(downloadUrl);
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

  if (isLoading) {
    return <LoadingState></LoadingState>;
  } else if (infraEnvError) {
    return <ErrorState></ErrorState>;
  }

  return (
    <DiscoveryImageConfigForm
      onCancel={handleCancel}
      handleSubmit={handleSubmit}
      sshPublicKey={infraEnv?.sshAuthorizedKey}
      httpProxy={infraEnv?.proxy?.httpProxy}
      httpsProxy={infraEnv?.proxy?.httpsProxy}
      noProxy={infraEnv?.proxy?.noProxy}
      imageType={infraEnv?.type}
    />
  );
};

export default DiscoveryImageForm;
