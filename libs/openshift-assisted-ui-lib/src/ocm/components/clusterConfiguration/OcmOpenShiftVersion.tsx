import React from 'react';
import {
  getOpenshiftVersionText,
  OpenshiftVersionOptionType,
  StaticTextField,
} from '../../../common';

type OcmOpenShiftVersionProps = {
  versions: OpenshiftVersionOptionType[];
  openshiftVersion: string;
  clusterCpuArchitecture: string | undefined;
  withPreviewText?: boolean;
  withMultiText?: boolean;
};

const OcmOpenShiftVersion = ({
  openshiftVersion,
  clusterCpuArchitecture,
  versions,
  withPreviewText,
  withMultiText,
}: OcmOpenShiftVersionProps) => {
  return (
    <StaticTextField name="openshiftVersion" label="OpenShift version" isRequired>
      Openshift{' '}
      {getOpenshiftVersionText({
        openshiftVersion,
        cpuArchitecture: clusterCpuArchitecture,
        versions,
        withPreviewText,
        withMultiText,
      })}
    </StaticTextField>
  );
};

export default OcmOpenShiftVersion;
