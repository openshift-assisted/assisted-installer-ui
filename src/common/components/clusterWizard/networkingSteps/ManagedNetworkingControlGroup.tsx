import React from 'react';
import { FormGroup, TooltipProps } from '@patternfly/react-core';
import { getFieldId } from '../../ui';
import RadioFieldWithTooltip from '../../ui/formik/RadioFieldWithTooltip';
import { useTranslation } from '../../../hooks/use-translation-wrapper';

export interface ManagedNetworkingControlGroupProps {
  disabled: boolean;
  tooltip?: string;
}

const GROUP_NAME = 'managedNetworkingType';
export const ManagedNetworkingControlGroup = ({
  disabled = false,
  tooltip,
}: ManagedNetworkingControlGroupProps) => {
  const tooltipProps: TooltipProps = {
    hidden: !tooltip || !disabled,
    content: tooltip,
    position: 'top',
  };
  const { t } = useTranslation();
  return (
    <FormGroup
      label={t('ai:Network Management')}
      fieldId={getFieldId(GROUP_NAME, 'radio')}
      isInline
    >
      <RadioFieldWithTooltip
        tooltipProps={tooltipProps}
        name={GROUP_NAME}
        isDisabled={disabled}
        value={'clusterManaged'}
        label={t('ai:Cluster-Managed Networking')}
      />
      <RadioFieldWithTooltip
        tooltipProps={tooltipProps}
        name={GROUP_NAME}
        isDisabled={disabled}
        value={'userManaged'}
        label={t('ai:User-Managed Networking')}
      />
    </FormGroup>
  );
};
