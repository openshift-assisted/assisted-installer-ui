import React from 'react';
import {
  ClusterCpuArchitecture,
  getOpenshiftVersionText,
  OpenshiftVersionOptionType,
  StaticTextField,
} from '../../../../common';

type OcmOpenShiftVersionProps = {
  versions?: OpenshiftVersionOptionType[];
  openshiftVersion: string;
  clusterCpuArchitecture?: string;
  withPreviewText?: boolean;
  withMultiText?: boolean;
};

export const OcmOpenShiftVersion = ({
  openshiftVersion,
  clusterCpuArchitecture,
  versions,
  withPreviewText,
  withMultiText,
}: OcmOpenShiftVersionProps) => {
  return (
    <StaticTextField name="openshiftVersion" label="OpenShift version" isRequired>
      OpenShift{' '}
      {getOpenshiftVersionText({
        openshiftVersion,
        cpuArchitecture: clusterCpuArchitecture as ClusterCpuArchitecture,
        versions,
        withPreviewText,
        withMultiText,
      })}
    </StaticTextField>
  );
};
