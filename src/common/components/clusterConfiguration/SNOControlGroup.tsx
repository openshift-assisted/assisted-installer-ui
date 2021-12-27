import React from 'react';
import { useFormikContext } from 'formik';
import { ClusterDetailsValues } from '../../../common/components/clusterWizard/types';
import { SingleNodeCheckbox } from '../ui';
import { OpenshiftVersionOptionType } from '../../types';
import SNODisclaimer from './SNODisclaimer';
import { FeatureSupportLevelContext } from '../featureSupportLevels';

type SNOControlGroupProps = {
  isDisabled?: boolean;
  versions: OpenshiftVersionOptionType[];
  highAvailabilityMode: ClusterDetailsValues['highAvailabilityMode'];
};

const SNOControlGroup = ({ versions, highAvailabilityMode, isDisabled }: SNOControlGroupProps) => {
  const { values } = useFormikContext<ClusterDetailsValues>();
  const featureSupportLevels = React.useContext(FeatureSupportLevelContext);
  const selectedVersion = versions.find((version) => version.value === values.openshiftVersion);
  // TODO(jtomasek): use getFeatureSupport('sno', selectedVersion.version) to get support level of SNO feature
  // for selected version once the API is available
  // https://issues.redhat.com/browse/MGMT-7787
  const snoSupportLevel = selectedVersion
    ? featureSupportLevels.getFeatureSupportLevel(selectedVersion.value, 'SNO')
    : undefined;

  return (
    <>
      <SingleNodeCheckbox name="highAvailabilityMode" versions={versions} isDisabled={isDisabled} />
      {highAvailabilityMode === 'None' && (
        <SNODisclaimer isDisabled={isDisabled} snoSupportLevel={snoSupportLevel} />
      )}
    </>
  );
};

export default SNOControlGroup;
