import React from 'react';
import { Split, SplitItem, Tooltip } from '@patternfly/react-core';
import { RadioField } from '../../ui/formik';
import { PopoverIcon } from '../../../components/ui';

export interface NetworkTypeControlGroupProps {
  isIPv6: boolean;
}

export const NetworkTypeControlGroup: React.FC<NetworkTypeControlGroupProps> = ({
  isIPv6 = false,
}) => {
  const GROUP_NAME = 'networkType';

  return (
    <Split hasGutter>
      <SplitItem>
        <Tooltip
          hidden={!isIPv6}
          content={'Software-Defined Networking (SDN) can be selected only when IPv4 is detected.'}
        >
          <RadioField
            name={GROUP_NAME}
            isDisabled={isIPv6}
            value={'OpenShiftSDN'}
            label={
              <>
                Software-Defined Networking{' '}
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
          name={GROUP_NAME}
          value={'OVNKubernetes'}
          label={
            <>
              Open Virtual Networking{' '}
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
  );
};
