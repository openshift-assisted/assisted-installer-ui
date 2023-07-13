import React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { PopoverIcon } from '../../../common';
import { OcmCheckboxField } from '../ui/OcmFormFields';
import { noop } from 'lodash-es';
import { CheckboxFieldProps } from '../../../common/components/ui/formik/types';
import {
  NewFeatureSupportLevelMap,
  useNewFeatureSupportLevel,
} from '../../../common/components/newFeatureSupportLevels';
import { clusterExistsReason as CLUSTER_EXISTS_REASON } from '../featureSupportLevels/featureStateUtils';

export const FEATURE_ID = 'EXTERNAL_PLATFORM_OCI';
export const FIELD_NAME = 'externalPartnerIntegrations';

export type ExternalPartnerIntegrationsCheckboxProps = {
  label: React.ReactNode;
  popoverContent: React.ReactNode;
  disabledStateTooltipContent: React.ReactNode;
  helperText: React.ReactNode;
  onChange: CheckboxFieldProps['onChange'];
  isDisabled: boolean;
};

export const ExternalPartnerIntegrationsCheckbox: React.FC<
  ExternalPartnerIntegrationsCheckboxProps
> = ({
  label,
  popoverContent,
  disabledStateTooltipContent,
  helperText,
  onChange = noop,
  isDisabled = false,
}) => {
  return (
    <OcmCheckboxField
      name={FIELD_NAME}
      label={
        <Tooltip hidden={!isDisabled} content={disabledStateTooltipContent}>
          <span>
            {label} <PopoverIcon id={FIELD_NAME} noVerticalAlign bodyContent={popoverContent} />
          </span>
        </Tooltip>
      }
      helperText={helperText}
      onChange={onChange}
      isDisabled={isDisabled}
    />
  );
};

export interface ExternalPartnerIntegrationsCheckboxState {
  readonly featureId: string;
  readonly fieldName: string;
  readonly isSupported: boolean;
  readonly isDisabled: boolean;
  readonly disabledReason?: string;
}

export const useExternalPartnerIntegrationsCheckboxState = (
  hasExistentCluster: boolean,
  featureSupportLevelData: NewFeatureSupportLevelMap | null,
): ExternalPartnerIntegrationsCheckboxState | null => {
  const featureSupportLevelContext = useNewFeatureSupportLevel();
  if (!featureSupportLevelData) {
    return null;
  }

  const isSupported = featureSupportLevelData
    ? featureSupportLevelContext.isFeatureSupported(FEATURE_ID, featureSupportLevelData)
    : false;
  const isDisabled = hasExistentCluster || !isSupported;
  let disabledReason: string | undefined;
  if (isDisabled) {
    if (hasExistentCluster) {
      disabledReason = CLUSTER_EXISTS_REASON;
    } else {
      disabledReason = featureSupportLevelContext.getFeatureDisabledReason(FEATURE_ID);
    }
  }

  return {
    featureId: FEATURE_ID,
    fieldName: FIELD_NAME,
    isSupported,
    isDisabled,
    disabledReason,
  };
};
