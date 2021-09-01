import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { PopoverIcon, RadioField } from '../../../common';

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
            popoverContent={'The generated discovery ISO will contain the full image file'}
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
            popoverContent={'The generated discovery ISO will contain the minimal image file'}
          />
        }
      />
    </StackItem>
  </Stack>
);

export default DiscoveryImageTypeControlGroup;
