import React from 'react';
import { useFormikContext } from 'formik';
import { ClusterDetailsValues } from '../../../common/components/clusterWizard/types';
import { isSNOSupportedVersion, SingleNodeCheckbox } from '../ui';
import { OpenshiftVersionOptionType } from '../../types';
import SNODisclaimer from './SNODisclaimer';
import { getSNOSupportLevel } from './utils';
import { Tooltip } from '@patternfly/react-core';

type SNOControlGroupProps = {
  isDisabled?: boolean;
  versions: OpenshiftVersionOptionType[];
  highAvailabilityMode: ClusterDetailsValues['highAvailabilityMode'];
};

const SNOControlGroup = ({ versions, highAvailabilityMode, isDisabled }: SNOControlGroupProps) => {
  const { values, setFieldValue } = useFormikContext<ClusterDetailsValues>();
  const selectedVersion = versions.find((version) => version.value === values.openshiftVersion);
  const [disable, setDisable] = React.useState(isDisabled);

  // TODO(jtomasek): use getFeatureSupport('sno', selectedVersion.version) to get support level of SNO feature
  // for selected version once the API is available
  // https://issues.redhat.com/browse/MGMT-7787
  const snoSupportLevel = getSNOSupportLevel(selectedVersion?.version);

  React.useEffect(() => {
    setDisable(isDisabled || (selectedVersion && !isSNOSupportedVersion(selectedVersion)));
    if (disable) {
      setFieldValue('highAvailabilityMode', 'Full');
    }
  }, [disable, isDisabled, selectedVersion, setFieldValue]);

  return (
    <Tooltip
      hidden={!disable}
      content={'Single-Node OpenShift is not supported in this OpenShift version'}
    >
      <SingleNodeCheckbox name="highAvailabilityMode" versions={versions} isDisabled={disable} />
      {highAvailabilityMode === 'None' && (
        <SNODisclaimer isDisabled={disable} snoSupportLevel={snoSupportLevel} />
      )}
    </Tooltip>
  );
};

export default SNOControlGroup;
