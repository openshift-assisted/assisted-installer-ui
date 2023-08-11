import React from 'react';
import { FormGroup, TooltipProps } from '@patternfly/react-core';
import { PopoverIcon, getFieldId } from '../../ui';
import RadioFieldWithTooltip from '../../ui/formik/RadioFieldWithTooltip';
import { useTranslation } from '../../../hooks/use-translation-wrapper';

export interface ManagedNetworkingControlGroupProps {
  disabled?: boolean;
  tooltipCmnDisabled?: string;
  tooltipUmnDisabled?: string;
}

const GROUP_NAME = 'managedNetworkingType';
export const ManagedNetworkingControlGroup = ({
  disabled = false,
  tooltipCmnDisabled,
  tooltipUmnDisabled,
}: ManagedNetworkingControlGroupProps) => {
  const { t } = useTranslation();
  const tooltipPropsCmn: TooltipProps = {
    hidden: !tooltipCmnDisabled || !disabled,
    content: tooltipCmnDisabled,
    position: 'top',
  };

  const tooltipPropsUmn: TooltipProps = {
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
        tooltipProps={tooltipPropsCmn}
        name={GROUP_NAME}
        isDisabled={disabled}
        value={'clusterManaged'}
        label={t('ai:Cluster-Managed Networking')}
      />
      <RadioFieldWithTooltip
        tooltipProps={tooltipPropsUmn}
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
