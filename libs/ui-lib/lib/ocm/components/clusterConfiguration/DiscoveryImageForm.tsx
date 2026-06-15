import React from 'react';
import { useDispatch } from 'react-redux';
import Axios, { CancelTokenSource } from 'axios';
import { FormikHelpers } from 'formik';
import { ModalBody } from '@patternfly/react-core';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import {
  getApiErrorMessage,
  handleApiError,
  isUnknownServerError,
  CpuArchitecture,
  ErrorState,
  LoadingState,
} from '../../../common';
import { useInfraEnv, usePullSecret } from '../../hooks';
import { forceReload, setServerUpdateError, updateCluster } from '../../store';
import { DiscoveryImageFormService, mapClusterCpuArchToInfraEnvCpuArch } from '../../services';
import { isOciPlatformType } from '../utils';
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
  const pullSecret = usePullSecret();
  const { infraEnv, error: infraEnvError } = useInfraEnv(
    cluster.id,
    cpuArchitecture,
    cluster.name,
    pullSecret,
    cluster.openshiftVersion,
  );
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
      const isIPXE = formValues['imageType'] === 'discovery-image-ipxe';
      try {
        const { updatedCluster } = await DiscoveryImageFormService.update(
          cluster.id,
          cluster.tags,
          infraEnv.id,
          formValues,
          undefined,
          isIPXE,
        );
        isIPXE ? await onSuccessIpxe() : await onSuccess();
        dispatch(updateCluster(updatedCluster));
      } catch (error) {
        handleApiError(error, () => {
          formikActions.setStatus({
            error: {
              title: isIPXE ? 'Failed to create ipxe scripts' : 'Failed to create discovery image',
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
  };

  if (infraEnvError) {
    return (
      <ModalBody style={{ height: '696px' }}>
        <ErrorState />
      </ModalBody>
    );
  }
  if (!infraEnv) {
    return (
      <ModalBody style={{ height: '696px' }}>
        <LoadingState />
      </ModalBody>
    );
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
      selectedCpuArchitecture={
        cpuArchitecture === CpuArchitecture.USE_DAY1_ARCHITECTURE
          ? mapClusterCpuArchToInfraEnvCpuArch(infraEnv.cpuArchitecture)
          : mapClusterCpuArchToInfraEnvCpuArch(cpuArchitecture)
      }
      isOracleCloudInfrastructure={isOciPlatformType(cluster)}
    />
  );
};

export default DiscoveryImageForm;
