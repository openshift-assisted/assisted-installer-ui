import React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { PopoverIcon } from '../ui';
import { RadioField } from '../ui/formik/RadioField';

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
    />
  </>
);

const DiscoveryImageTypeControlGroup = () => (
  <Flex justifyContent={{ default: 'justifyContentFlexStart' }}>
    <FlexItem>
      <RadioField
        name={GROUP_NAME}
        id={'full-iso'}
        value={'full-iso'}
        label={
          <DiscoveryImageTypeControlGroupLabel
            text={'Full ISO'}
            popoverContent={
              'Use when you plan to boot your host by attaching the ISO with virtual media. ' +
              'Minimal ISO contains a smaller image size, and only part of the image will ' +
              'download on the first boot.'
            }
          />
        }
      />
    </FlexItem>
    <FlexItem spacer={{ default: 'spacer4xl' }} />
    <FlexItem>
      <RadioField
        name={GROUP_NAME}
        id={'minimal-iso'}
        value={'minimal-iso'}
        label={
          <DiscoveryImageTypeControlGroupLabel
            text={'Minimal ISO'}
            popoverContent={
              'Use when you want to boot from a USB drive or use PXE booting. ' +
              'All data is present in a full ISO and will be downloaded on the first boot.'
            }
          />
        }
      />
    </FlexItem>
  </Flex>
);

export default DiscoveryImageTypeControlGroup;
