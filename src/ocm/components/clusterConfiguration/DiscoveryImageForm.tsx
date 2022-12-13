import React from 'react';
import { useDispatch } from 'react-redux';
import Axios, { CancelTokenSource } from 'axios';
import { FormikHelpers } from 'formik';
import { getApiErrorMessage, handleApiError } from '../../api';
import {
  Cluster,
  CpuArchitecture,
  DiscoveryImageFormValues,
  ErrorState,
  LoadingState,
  StatusErrorType,
} from '../../../common';
import { forceReload, updateCluster } from '../../reducers/clusters';
import useInfraEnv from '../../hooks/useInfraEnv';
import { DiscoveryImageFormService } from '../../services';
import { OcmDiscoveryImageConfigForm } from './OcmDiscoveryImageConfigForm';

type DiscoveryImageFormProps = {
  cluster: Cluster;
  onCancel: () => void;
  onSuccess: () => Promise<void>;
  cpuArchitecture: CpuArchitecture;
  onSuccessIpxe: () => Promise<void>;
};

const DiscoveryImageForm = ({
  cluster,
  onCancel,
  onSuccess,
  cpuArchitecture,
  onSuccessIpxe,
}: DiscoveryImageFormProps) => {
  const { infraEnv, error: infraEnvError } = useInfraEnv(cluster.id, cpuArchitecture);
  const cancelSourceRef = React.useRef<CancelTokenSource>();
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
    formValues: DiscoveryImageFormValues,
    formikActions: FormikHelpers<DiscoveryImageFormValues>,
  ) => {
    if (cluster.id && infraEnv?.id) {
      if (formValues['imageType'] !== 'full-iso' && formValues['imageType'] !== 'minimal-iso') {
        await onSuccessIpxe();
      } else {
        try {
          const { updatedCluster } = await DiscoveryImageFormService.update(
            cluster.id,
            cluster.tags,
            infraEnv.id,
            formValues,
          );
          await onSuccess();
          dispatch(updateCluster(updatedCluster));
        } catch (e) {
          handleApiError(e, () => {
            const error: StatusErrorType = {
              error: {
                title: 'Failed to download the discovery Image',
                message: getApiErrorMessage(e),
              },
            };
            formikActions.setStatus(error);
          });
        }
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
    <OcmDiscoveryImageConfigForm
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
