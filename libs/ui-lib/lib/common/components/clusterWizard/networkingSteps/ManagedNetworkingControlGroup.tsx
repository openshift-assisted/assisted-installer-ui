import React from 'react';
import { FormGroup, TooltipProps } from '@patternfly/react-core';
import { PopoverIcon, getFieldId } from '../../ui';
import RadioFieldWithTooltip from '../../ui/formik/RadioFieldWithTooltip';
import { useTranslation } from '../../../hooks/use-translation-wrapper';

export interface ManagedNetworkingControlGroupProps {
  disabled?: boolean;
  tooltip?: string;
  tooltipUmnDisabled?: string;
}

const GROUP_NAME = 'managedNetworkingType';
export const ManagedNetworkingControlGroup = ({
  disabled = false,
  tooltip,
  tooltipUmnDisabled,
}: ManagedNetworkingControlGroupProps) => {
  const tooltipProps: TooltipProps = {
    hidden: !tooltip || !disabled,
    content: tooltip,
    position: 'top',
  };

  const { t } = useTranslation();

  const tooltipPropsUmnDisabled: TooltipProps = {
    hidden: !tooltipUmnDisabled || !disabled,
    content: tooltipUmnDisabled,
    position: 'top',
  };
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
        tooltipProps={tooltipUmnDisabled ? tooltipPropsUmnDisabled : tooltipProps}
        name={GROUP_NAME}
        isDisabled={disabled}
        value={'userManaged'}
        label={
          <>
            <span>{t('ai:User-Managed Networking')}</span>{' '}
            <PopoverIcon
              bodyContent={
                "With User-Managed Networking, you'll need to provide and configure a load balancer for the API and ingress endpoints."
              }
            />
          </>
        }
      />
    </FormGroup>
  );
};
