import React from 'react';
import { Split, SplitItem, Tooltip, FormGroup } from '@patternfly/react-core';
import { RadioField } from '../../ui/formik';
import { PopoverIcon } from '../../../components/ui';
import { NETWORK_TYPE_OVN, NETWORK_TYPE_SDN } from '../../../config';
import { useTranslation } from '../../../hooks/use-translation-wrapper';

const GROUP_NAME = 'networkType';

export interface NetworkTypeControlGroupProps {
  isDisabled?: boolean;
  isSDNSelectable: boolean;
}

export const NetworkTypeControlGroup = ({
  isDisabled = false,
  isSDNSelectable,
}: NetworkTypeControlGroupProps) => {
  const { t } = useTranslation();
  return (
    <FormGroup isInline fieldId={GROUP_NAME} label="Network type">
      <Split>
        <SplitItem>
          <Tooltip
            hidden={isSDNSelectable}
            content={t(
              'ai:Software-Defined Networking (SDN) cannot be selected for SNO clusters or when IPv6 is detected.',
            )}
          >
            <RadioField
              id={GROUP_NAME}
              name={GROUP_NAME}
              isDisabled={isDisabled || !isSDNSelectable}
              value={NETWORK_TYPE_OVN}
              label={<>{t('ai:Open Virtual Networking (OVN)')}&nbsp;</>}
            />
          </Tooltip>
        </SplitItem>
        <SplitItem>
          <PopoverIcon
            bodyContent={
              "The next generation networking type, select this when you're using new features and telco features"
            }
            buttonStyle={{ top: '-4px' }}
          />
        </SplitItem>
      </Split>
      <Split>
        <SplitItem>
          <Tooltip
            hidden={isSDNSelectable}
            content={t(
              'ai:Software-Defined Networking (SDN) cannot be selected for SNO clusters or when IPv6 is detected.',
            )}
          >
            <RadioField
              id={GROUP_NAME}
              name={GROUP_NAME}
              isDisabled={isDisabled || !isSDNSelectable}
              value={NETWORK_TYPE_SDN}
              label={<>{t('ai:Software-Defined Networking (SDN)')}&nbsp;</>}
            />
          </Tooltip>
        </SplitItem>
        <SplitItem>
          <PopoverIcon
            bodyContent={'The classic bullet-proof networking type'}
            buttonStyle={{ top: '-4px' }}
          />
        </SplitItem>
      </Split>
    </FormGroup>
  );
};
