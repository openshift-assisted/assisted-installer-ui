import React from 'react';
import { useFormikContext } from 'formik';
import { ClusterDetailsValues } from '../../../common/components/clusterWizard/types';
import OcmSingleNodeCheckbox from './OcmSingleNodeCheckbox';
import { useNewFeatureSupportLevel } from '../../../common/components/newFeatureSupportLevels';
import OcmSNODisclaimer from './OcmSNODisclaimer';

type OcmSNOControlGroupProps = {
  highAvailabilityMode: ClusterDetailsValues['highAvailabilityMode'];
  openshiftVersion?: string;
  cpuArchitecture?: string;
};

const OcmSNOControlGroup = ({ highAvailabilityMode }: OcmSNOControlGroupProps) => {
  const { values } = useFormikContext<ClusterDetailsValues>();
  console.log(values.openshiftVersion);
  console.log(values.cpuArchitecture);
  //const featureSupportLevelContext = useFeatureSupportLevel();
  const newFeatureSupportLevelContext = useNewFeatureSupportLevel();
  const snoNewSupportLevel = newFeatureSupportLevelContext.getFeatureSupportLevel('SNO');
  console.log(snoNewSupportLevel);
  const snoSupportLevel = newFeatureSupportLevelContext.getFeatureSupportLevel('SNO');
  const snoExpansion = newFeatureSupportLevelContext.isFeatureSupported('SINGLE_NODE_EXPANSION');
  const isDisabled = newFeatureSupportLevelContext.isFeatureDisabled('SNO');

  return (
    <>
      <OcmSingleNodeCheckbox name="highAvailabilityMode" isDisabled={isDisabled} />
      {highAvailabilityMode === 'None' && snoSupportLevel && (
        <OcmSNODisclaimer
          isDisabled={isDisabled}
          snoSupportLevel={snoSupportLevel}
          snoExpansionSupported={snoExpansion}
        />
      )}
    </>
  );
};

export default OcmSNOControlGroup;
