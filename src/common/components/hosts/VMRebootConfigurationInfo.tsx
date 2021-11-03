import React from 'react';
import {
  Button,
  ButtonVariant,
  Popover,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { PrismCode } from '../../../common/components/ui';

const Hint = () => (
  <TextContent>
    <Text component={TextVariants.p}>
      Your libvirt virtual machines should be configured to restart automatically after a reboot.
      You can check this by running:
    </Text>
    <PrismCode code="virsh dumpxml <name> | grep on_reboot" />
    <Text component={TextVariants.p}>And verify that this is the output:</Text>
    <PrismCode code="<on_reboot>restart</on_reboot>" />
    <Text component={TextVariants.p}>
      If not, please start your VMs with the following configuration:
    </Text>
    <PrismCode code="--events on_reboot=restart" />
    <Text component={TextVariants.p}>
      When using <code>virt-install</code>, please run:
    </Text>
    <PrismCode code="virt-install --wait -1 <rest of the command>" />
    <Text component={TextVariants.p}>
      Otherwise, the VMs will not be able to reboot during the installation process.
    </Text>
  </TextContent>
);

const VMRebootConfigurationInfo: React.FC = () => (
  <Text component="p">
    <Popover bodyContent={<Hint />} minWidth="35rem">
      <Button variant={ButtonVariant.link} isInline>
        <InfoCircleIcon size="sm" />
        &nbsp;Check your VM reboot configuration
      </Button>
    </Popover>
  </Text>
);

export default VMRebootConfigurationInfo;
