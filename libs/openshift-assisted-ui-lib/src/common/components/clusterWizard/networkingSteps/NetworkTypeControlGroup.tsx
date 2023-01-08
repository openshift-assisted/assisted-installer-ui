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
    <FormGroup fieldId={GROUP_NAME} label="Network type">
      <Split hasGutter>
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
              label={
                <>
                  {t('ai:Software-Defined Networking (SDN)')}{' '}
                  <PopoverIcon
                    noVerticalAlign
                    bodyContent={'The classic bullet-proof networking type'}
                  />
                </>
              }
            />
          </Tooltip>
        </SplitItem>
        <SplitItem />
        <SplitItem>
          <RadioField
            id={GROUP_NAME}
            name={GROUP_NAME}
            isDisabled={isDisabled}
            value={NETWORK_TYPE_OVN}
            label={
              <>
                {t('ai:Open Virtual Networking (OVN)')}{' '}
                <PopoverIcon
                  noVerticalAlign
                  bodyContent={
                    "The next generation networking type, select this when you're using new features and telco features"
                  }
                />
              </>
            }
          />
        </SplitItem>
      </Split>
    </FormGroup>
  );
};
