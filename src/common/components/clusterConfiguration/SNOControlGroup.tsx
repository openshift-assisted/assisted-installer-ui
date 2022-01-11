import React from 'react';
import { useFormikContext } from 'formik';
import { ClusterDetailsValues } from '../../../common/components/clusterWizard/types';
import { SingleNodeCheckbox } from '../ui';
import { OpenshiftVersionOptionType, SupportLevel } from '../../types';
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
  const [snoSupportLevel, setSnoSupportLevel] = React.useState<SupportLevel>();
  React.useEffect(() => {
    if (values.openshiftVersion) {
      const supportLevel = featureSupportLevels.getFeatureSupportLevel(
        values.openshiftVersion,
        'SNO',
      );
      //TODO(brotman): add error handling if supportLevel isn't found
      setSnoSupportLevel(supportLevel);
    }
  }, [values.openshiftVersion, setSnoSupportLevel, featureSupportLevels]);
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
