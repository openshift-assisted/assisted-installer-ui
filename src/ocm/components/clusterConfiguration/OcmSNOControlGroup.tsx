import React from 'react';
import { ClusterDetailsValues } from '../../../common/components/clusterWizard/types';
import OcmSingleNodeCheckbox from './OcmSingleNodeCheckbox';
import { useNewFeatureSupportLevel } from '../../../common/components/newFeatureSupportLevels';
import OcmSNODisclaimer from './OcmSNODisclaimer';
import { SupportLevels } from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

type OcmSNOControlGroupProps = {
  highAvailabilityMode: ClusterDetailsValues['highAvailabilityMode'];
  featureSupportLevelData?: SupportLevels;
};

const OcmSNOControlGroup = ({
  highAvailabilityMode,
  featureSupportLevelData,
}: OcmSNOControlGroupProps) => {
  const { t } = useTranslation();
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
    t,
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
