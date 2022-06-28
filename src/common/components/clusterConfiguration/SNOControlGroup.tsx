import React from 'react';
import { useFormikContext } from 'formik';
import { ClusterDetailsValues } from '../../../common/components/clusterWizard/types';
import { SingleNodeCheckbox } from '../ui';
import { OpenshiftVersionOptionType } from '../../types';
import SNODisclaimer from './SNODisclaimer';
import { useFeatureSupportLevel } from '../featureSupportLevels';

type SNOControlGroupProps = {
  versions: OpenshiftVersionOptionType[];
  highAvailabilityMode: ClusterDetailsValues['highAvailabilityMode'];
};

const SNOControlGroup = ({ versions, highAvailabilityMode }: SNOControlGroupProps) => {
  const { values } = useFormikContext<ClusterDetailsValues>();
  const featureSupportLevelContext = useFeatureSupportLevel();
  const snoSupportLevel = featureSupportLevelContext.getFeatureSupportLevel(
    values.openshiftVersion,
    'SNO',
  );
  const snoExpansion = featureSupportLevelContext.isFeatureSupported(
    values.openshiftVersion,
    'SINGLE_NODE_EXPANSION',
  );
  const isDisabled = featureSupportLevelContext.isFeatureDisabled(values.openshiftVersion, 'SNO');

  return (
    <>
      <SingleNodeCheckbox name="highAvailabilityMode" versions={versions} isDisabled={isDisabled} />
      {highAvailabilityMode === 'None' && snoSupportLevel && (
        <SNODisclaimer
          isDisabled={isDisabled}
          snoSupportLevel={snoSupportLevel}
          snoExpansionSupported={snoExpansion}
        />
      )}
    </>
  );
};

export default SNOControlGroup;
