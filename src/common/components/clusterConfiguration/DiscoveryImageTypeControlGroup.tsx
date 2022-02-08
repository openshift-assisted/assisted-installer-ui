import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { PopoverIcon, RadioField } from '../ui';

const GROUP_NAME = 'imageType';

const DiscoveryImageTypeControlGroupLabel = ({
  text,
  popoverContent,
}: {
  text: string;
  popoverContent: string;
}) => (
  <>
    {text}
    <PopoverIcon
      component={'a'}
      variant={'plain'}
      IconComponent={HelpIcon}
      bodyContent={popoverContent}
      noVerticalAlign
    />
  </>
);

const DiscoveryImageTypeControlGroup = () => (
  <Stack hasGutter>
    <StackItem>
      <RadioField
        name={GROUP_NAME}
        id={'full-iso'}
        value={'full-iso'}
        label={
          <DiscoveryImageTypeControlGroupLabel
            text={'Full image file: Provision with physical media'}
            popoverContent={
              'Recommended option. The generated discovery ISO will contain everything needed to boot.'
            }
          />
        }
      />
    </StackItem>
    <StackItem>
      <RadioField
        name={GROUP_NAME}
        id={'minimal-iso'}
        value={'minimal-iso'}
        label={
          <DiscoveryImageTypeControlGroupLabel
            text={'Minimal image file: Provision with virtual media'}
            popoverContent={
              'The generated discovery ISO will be smaller, but will need to download additional data during boot. ' +
              "This option is useful if ISO storage capacity is limited or if it's being served over a constrained network."
            }
          />
        }
      />
    </StackItem>
  </Stack>
);

export default DiscoveryImageTypeControlGroup;
