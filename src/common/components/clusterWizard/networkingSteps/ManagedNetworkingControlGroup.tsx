import React from 'react';
import { FormGroup, TooltipProps } from '@patternfly/react-core';
import { getFieldId } from '../../ui';
import RadioFieldWithTooltip from '../../ui/formik/RadioFieldWithTooltip';
import { useTranslation } from '../../../hooks/use-translation-wrapper';

export interface ManagedNetworkingControlGroupProps {
  disabled: boolean;
  tooltip?: string;
  isUmnDisabled?: boolean;
}

const GROUP_NAME = 'managedNetworkingType';
export const ManagedNetworkingControlGroup = ({
  disabled = false,
  tooltip,
  isUmnDisabled,
}: ManagedNetworkingControlGroupProps) => {
  const tooltipProps: TooltipProps = {
    hidden: !tooltip || !disabled,
    content: tooltip,
    position: 'top',
  };
  const tooltipPropsUmnDisabled: TooltipProps = {
    hidden: !isUmnDisabled,
    content: tooltipUmnDisabled,
    position: 'top',
  };
  const { t } = useTranslation();
  const tooltipUmnDisabled = t('ai:User-Managed Networking is not supported when using Nutanix');

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
        tooltipProps={isUmnDisabled ? tooltipPropsUmnDisabled : tooltipProps}
        name={GROUP_NAME}
        isDisabled={disabled || (isUmnDisabled ? isUmnDisabled : false)}
        value={'userManaged'}
        label={t('ai:User-Managed Networking')}
      />
    </FormGroup>
  );
};
