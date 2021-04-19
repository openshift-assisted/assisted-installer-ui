import React from 'react';
import { useFormikContext } from 'formik';
import { HostDiscoveryValues } from '../../types/clusters';
import {
  Button,
  ButtonVariant,
  Popover,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

const Hint = () => (
  <TextContent>
    <Text component={TextVariants.p}>
      All installation disks are going to be used for local storage. <br />
      The list of the disks is available under each host row in the table below.
      <br />
      Please format the disks before installing.
    </Text>
  </TextContent>
);

const OCSDisksManualFormattingHint = () => {
  const { values } = useFormikContext<HostDiscoveryValues>();
  return values.useExtraDisksForLocalStorage ? (
    <Text component="p">
      <Popover bodyContent={<Hint />} minWidth="30rem">
        <Button variant={ButtonVariant.link} isInline>
          <InfoCircleIcon size="sm" />
          &nbsp;Ensure that storage disks are formatted before installation
        </Button>
      </Popover>
    </Text>
  ) : null;
};

export default OCSDisksManualFormattingHint;
