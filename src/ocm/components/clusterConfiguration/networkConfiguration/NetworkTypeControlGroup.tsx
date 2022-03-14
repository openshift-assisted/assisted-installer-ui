import React from 'react';
import { Split, SplitItem, Tooltip, FormGroup } from '@patternfly/react-core';
import { PopoverIcon, RadioField } from '../../../../common/components/ui';

export interface NetworkTypeControlGroupProps {
  enableSDN?: boolean;
}

export const NetworkTypeControlGroup: React.FC<NetworkTypeControlGroupProps> = ({
  enableSDN = true,
}) => {
  const GROUP_NAME = 'networkType';

  return (
    <FormGroup fieldId={GROUP_NAME} label="Network type">
      <Split hasGutter>
        <SplitItem>
          <Tooltip
            hidden={enableSDN}
            content={'Software-Defined Networking (SDN) cannot be selected when IPv6 is detected.'}
          >
            <RadioField
              id={GROUP_NAME}
              name={GROUP_NAME}
              isDisabled={!enableSDN}
              value={'OpenShiftSDN'}
              label={
                <>
                  Software-Defined Networking (SDN){' '}
                  <PopoverIcon
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
            value={'OVNKubernetes'}
            label={
              <>
                Open Virtual Networking (OVN){' '}
                <PopoverIcon
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
