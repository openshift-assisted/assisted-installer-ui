import React from 'react';
import { Split, SplitItem, FormGroup } from '@patternfly/react-core';
import { RadioField } from '../../ui/formik';
import { PopoverIcon } from '../../../components/ui';

const GROUP_NAME = 'networkType';
export interface NetworkTypeControlGroupProps {
  isIPv6: boolean;
  isSNO: boolean;
}

export const NetworkTypeControlGroup: React.FC<NetworkTypeControlGroupProps> = ({
  isIPv6 = false,
  isSNO = false,
}) => {
  const isSDNSelectable = !(isSNO || isIPv6);
  const SDNIconContent = `The classic bullet-proof networking type.${
    isSDNSelectable ? '' : ' Not available in SNO clusters or clusters using IPv6'
  }`;

  return (
    <FormGroup fieldId={GROUP_NAME} label="Network type">
      <Split hasGutter>
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
        <SplitItem />
        <SplitItem>
          <RadioField
            id={GROUP_NAME}
            name={GROUP_NAME}
            isDisabled={!isSDNSelectable}
            value={'OpenShiftSDN'}
            label={
              <>
                Software-Defined Networking (SDN){' '}
                <PopoverIcon variant={'plain'} bodyContent={SDNIconContent} />
              </>
            }
          />
        </SplitItem>
      </Split>
    </FormGroup>
  );
};
