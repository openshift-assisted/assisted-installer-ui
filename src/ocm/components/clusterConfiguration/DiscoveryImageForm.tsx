import React from 'react';
import { useDispatch } from 'react-redux';
import Axios, { CancelTokenSource } from 'axios';
import { FormikHelpers } from 'formik';
import { getApiErrorMessage, handleApiError } from '../../api';
import {
  Cluster,
  CpuArchitecture,
  DiscoveryImageConfigForm,
  DiscoveryImageFormValues,
  ErrorState,
  LoadingState,
} from '../../../common';
import { forceReload, updateCluster } from '../../reducers/clusters';
import { usePullSecret } from '../../hooks';
import useInfraEnv from '../../hooks/useInfraEnv';
import { DiscoveryImageFormService } from '../../services';

type DiscoveryImageFormProps = {
  cluster: Cluster;
  onCancel: () => void;
  onSuccess: () => Promise<void>;
};

const DiscoveryImageForm: React.FC<DiscoveryImageFormProps> = ({
  cluster,
  onCancel,
  onSuccess,
}) => {
  const { infraEnv, error: infraEnvError } = useInfraEnv(
    cluster.id,
    CpuArchitecture.USE_DAY1_ARCHITECTURE,
  );
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
        const { updatedCluster } = await DiscoveryImageFormService.update(
          cluster.id,
          cluster.tags,
          infraEnv.id,
          formValues,
          ocmPullSecret,
        );
        await onSuccess();
        dispatch(updateCluster(updatedCluster));
      } catch (error) {
        handleApiError(error, () => {
          formikActions.setStatus({
            error: {
              title: 'Failed to download the discovery Image',
              message: getApiErrorMessage(error),
            },
          });
        });
      }
    }
  };

  if (infraEnvError) {
    return <ErrorState />;
  }
  if (!infraEnv) {
    return <LoadingState />;
  }

  return (
    <DiscoveryImageConfigForm
      onCancel={handleCancel}
      handleSubmit={handleSubmit}
      sshPublicKey={infraEnv.sshAuthorizedKey}
      httpProxy={infraEnv.proxy?.httpProxy}
      httpsProxy={infraEnv.proxy?.httpsProxy}
      noProxy={infraEnv.proxy?.noProxy}
      imageType={infraEnv.type}
    />
  );
};

export default DiscoveryImageForm;
