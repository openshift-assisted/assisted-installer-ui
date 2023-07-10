import React from 'react';
import { ClusterDetailsValues } from '../../../common/components/clusterWizard/types';
import OcmSingleNodeCheckbox from './OcmSingleNodeCheckbox';
import {
  NewFeatureSupportLevelMap,
  useNewFeatureSupportLevel,
} from '../../../common/components/newFeatureSupportLevels';
import OcmSNODisclaimer from './OcmSNODisclaimer';

type OcmSNOControlGroupProps = {
  highAvailabilityMode: ClusterDetailsValues['highAvailabilityMode'];
  featureSupportLevelData?: NewFeatureSupportLevelMap;
};

const OcmSNOControlGroup = ({
  highAvailabilityMode,
  featureSupportLevelData,
}: OcmSNOControlGroupProps) => {
  const newFeatureSupportLevelContext = useNewFeatureSupportLevel();

  const snoSupportLevel = newFeatureSupportLevelContext.getFeatureSupportLevel(
    'SNO',
    featureSupportLevelData,
  );
  const snoExpansion = newFeatureSupportLevelContext.isFeatureSupported(
    'SINGLE_NODE_EXPANSION',
    featureSupportLevelData,
  );
  const isDisabled = newFeatureSupportLevelContext.isFeatureDisabled(
    'SNO',
    featureSupportLevelData,
  );
  const disabledReason = newFeatureSupportLevelContext.getFeatureDisabledReason(
    'SNO',
    featureSupportLevelData,
  );

  const isSupportedVersionAvailable = newFeatureSupportLevelContext.isFeatureSupported(
    'SNO',
    featureSupportLevelData,
  );
  return (
    <>
      <OcmSingleNodeCheckbox
        name="highAvailabilityMode"
        isDisabled={isDisabled}
        disabledReason={disabledReason}
        isSupportedVersionAvailable={isSupportedVersionAvailable}
        supportLevel={snoSupportLevel}
      />
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
