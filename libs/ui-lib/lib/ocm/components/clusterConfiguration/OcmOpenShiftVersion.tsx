import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import {
  ClusterCpuArchitecture,
  getOpenshiftVersionText,
  OpenshiftVersionOptionType,
  StaticTextField,
} from '../../../common';

type OcmOpenShiftVersionProps = {
  versions?: OpenshiftVersionOptionType[];
  openshiftVersion: string;
  clusterCpuArchitecture?: string;
  withPreviewText?: boolean;
  withMultiText?: boolean;
};

const OcmOpenShiftVersion = ({
  openshiftVersion,
  clusterCpuArchitecture,
  versions,
  withPreviewText,
  withMultiText,
  children,
}: React.PropsWithChildren<OcmOpenShiftVersionProps>) => {
  return (
    <StaticTextField name="openshiftVersion" label="OpenShift version" isRequired>
      <Stack>
        <StackItem>
          OpenShift{' '}
          {getOpenshiftVersionText({
            openshiftVersion,
            cpuArchitecture: clusterCpuArchitecture as ClusterCpuArchitecture,
            versions,
            withPreviewText,
            withMultiText,
          })}
        </StackItem>
        {children && <StackItem>{children}</StackItem>}
      </Stack>
    </StaticTextField>
  );
};

export default OcmOpenShiftVersion;
