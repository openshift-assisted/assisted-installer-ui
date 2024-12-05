import React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import { PopoverIcon, RadioField } from '../ui';
import { useTranslation } from '../../hooks/use-translation-wrapper';

const GROUP_NAME = 'imageType';

const DiscoveryImageTypeControlGroupLabel = ({
  text,
  popoverContent,
}: {
  text: string;
  popoverContent: string;
}) => (
  <>
    {text} <PopoverIcon component={'a'} bodyContent={popoverContent} noVerticalAlign />
  </>
);

const DiscoveryImageTypeControlGroup = () => {
  const { t } = useTranslation();
  return (
    <Flex>
      <FlexItem spacer={{ default: 'spacer2xl' }}>
        <RadioField
          name={GROUP_NAME}
          id={'minimal-iso'}
          value={'minimal-iso'}
          label={
            <DiscoveryImageTypeControlGroupLabel
              text={t('ai:Minimal image file')}
              popoverContent={t(
                "ai:Recommended option. The generated discovery ISO will be smaller, but will need to download additional data during boot. This option is useful if ISO storage capacity is limited or if it's being served over a constrained network.",
              )}
            />
          }
        />
      </FlexItem>
      <FlexItem>
        <RadioField
          name={GROUP_NAME}
          id={'full-iso'}
          value={'full-iso'}
          label={
            <DiscoveryImageTypeControlGroupLabel
              text={t('ai:Full image file')}
              popoverContent={t(
                'ai:The generated discovery ISO will contain everything needed to boot.',
              )}
            />
          }
        />
      </FlexItem>
    </Flex>
  );
};

export default DiscoveryImageTypeControlGroup;
