import React from 'react';
import { useDispatch } from 'react-redux';
import Axios, { CancelTokenSource } from 'axios';
import { FormikHelpers } from 'formik';
import { getApiErrorMessage, handleApiError, isUnknownServerError } from '../../api';
import { Cluster, CpuArchitecture, ErrorState, LoadingState } from '../../../common';
import { forceReload, setServerUpdateError, updateCluster } from '../../reducers/clusters';
import useInfraEnv from '../../hooks/useInfraEnv';
import { DiscoveryImageFormService } from '../../services';
import {
  OcmDiscoveryImageConfigForm,
  OcmDiscoveryImageFormValues,
} from './OcmDiscoveryImageConfigForm';

type DiscoveryImageFormProps = {
  cluster: Cluster;
  onCancel: () => void;
  onSuccess: () => Promise<void>;
  cpuArchitecture: CpuArchitecture;
  onSuccessIpxe: () => Promise<void>;
  isIpxeSelected?: boolean;
};

const DiscoveryImageForm = ({
  cluster,
  onCancel,
  onSuccess,
  cpuArchitecture,
  onSuccessIpxe,
  isIpxeSelected,
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
    formValues: OcmDiscoveryImageFormValues,
    formikActions: FormikHelpers<OcmDiscoveryImageFormValues>,
  ) => {
    if (cluster.id && infraEnv?.id) {
      if (formValues['imageType'] === 'discovery-image-ipxe') {
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
        } catch (error) {
          handleApiError(error, () => {
            formikActions.setStatus({
              error: {
                title: 'Failed to create discovery image',
                message: getApiErrorMessage(error),
              },
            });
          });
          if (isUnknownServerError(error as Error)) {
            dispatch(setServerUpdateError());
            onCancel();
          }
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
      enableCertificate={infraEnv.additionalTrustBundle !== undefined}
      trustBundle={infraEnv.additionalTrustBundle}
      isIpxeSelected={isIpxeSelected}
    />
  );
};

export default DiscoveryImageForm;
