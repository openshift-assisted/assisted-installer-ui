import React from 'react';
import { Split, SplitItem, Tooltip, FormGroup } from '@patternfly/react-core';
import { RadioField } from '../../ui/formik';
import { PopoverIcon } from '../../../components/ui';
import { NETWORK_TYPE_OVN, NETWORK_TYPE_SDN } from '../../../config';

const GROUP_NAME = 'networkType';
export interface NetworkTypeControlGroupProps {
  isSDNSelectable: boolean;
}

export const NetworkTypeControlGroup: React.FC<NetworkTypeControlGroupProps> = ({
  isSDNSelectable,
}) => {
  return (
    <FormGroup fieldId={GROUP_NAME} label="Network type">
      <Split hasGutter>
        <SplitItem>
          <Tooltip
            hidden={isSDNSelectable}
            content={
              'Software-Defined Networking (SDN) cannot be selected for SNO clusters or when IPv6 is detected.'
            }
          >
            <RadioField
              id={GROUP_NAME}
              name={GROUP_NAME}
              isDisabled={!isSDNSelectable}
              value={NETWORK_TYPE_SDN}
              label={
                <>
                  Software-Defined Networking (SDN){' '}
                  <PopoverIcon
                    noVerticalAlign
                    variant={'plain'}
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
            value={NETWORK_TYPE_OVN}
            label={
              <>
                Open Virtual Networking (OVN){' '}
                <PopoverIcon
                  noVerticalAlign
                  variant={'plain'}
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
