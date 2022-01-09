import React from 'react';
import { useFormikContext } from 'formik';
import { ClusterDetailsValues } from '../../../common/components/clusterWizard/types';
import { SingleNodeCheckbox } from '../ui';
import { OpenshiftVersionOptionType } from '../../types';
import SNODisclaimer from './SNODisclaimer';
import { FeatureSupportLevelContext } from '../featureSupportLevels';

type SNOControlGroupProps = {
  versions: OpenshiftVersionOptionType[];
  highAvailabilityMode: ClusterDetailsValues['highAvailabilityMode'];
};

const SNOControlGroup = ({ versions, highAvailabilityMode }: SNOControlGroupProps) => {
  const { values } = useFormikContext<ClusterDetailsValues>();
  const { isFeatureDisabled, getFeatureSupportLevel } = React.useContext(
    FeatureSupportLevelContext,
  );
  const snoSupportLevel = getFeatureSupportLevel(values.openshiftVersion, 'SNO');
  const isDisabled = isFeatureDisabled(values.openshiftVersion, 'SNO');
  return (
    <>
      <SingleNodeCheckbox name="highAvailabilityMode" versions={versions} isDisabled={isDisabled} />
      {highAvailabilityMode === 'None' && snoSupportLevel && (
        <SNODisclaimer isDisabled={isDisabled} snoSupportLevel={snoSupportLevel} />
      )}
    </>
  );
};

export default SNOControlGroup;
