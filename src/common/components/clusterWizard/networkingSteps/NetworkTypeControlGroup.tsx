import React from 'react';
import { Split, SplitItem, Tooltip, FormGroup } from '@patternfly/react-core';
import { RadioField } from '../../ui/formik';
import { PopoverIcon } from '../../../components/ui';

export interface NetworkTypeControlGroupProps {
  isIPv6: boolean;
  isSNO: boolean;
}

export const NetworkTypeControlGroup: React.FC<NetworkTypeControlGroupProps> = ({
  isIPv6 = false,
  isSNO = false,
}) => {
  const GROUP_NAME = 'networkType';

  return (
    <FormGroup fieldId={GROUP_NAME} label="Network type">
      <Split hasGutter>
        <SplitItem>
          <Tooltip
            hidden={!isIPv6 && !isSNO}
            content={
              'Software-Defined Networking (SDN) can be selected only in non SNO clusters or when IPv4 is detected.'
            }
          >
            <RadioField
              id={GROUP_NAME}
              name={GROUP_NAME}
              isDisabled={isIPv6 || isSNO}
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
