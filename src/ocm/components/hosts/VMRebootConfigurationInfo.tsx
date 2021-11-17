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
import { Host, stringToJSON, Inventory, PrismCode } from '../../../common';

const HintOnReboot = () => (
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
  </TextContent>
);

const HintVirtInstall = () => (
  <TextContent>
    <Text component={TextVariants.p}>When using virt-install, please run:</Text>
    <PrismCode code="virt-install --wait -1 <rest of the command>" />
    <Text component={TextVariants.p}>
      Otherwise, machines will not be able to reboot in the middle of installation, and will stay
      shut down.
    </Text>
  </TextContent>
);

const VMRebootConfigurationInfo: React.FC<{ hosts: Host[] }> = ({ hosts }) => {
  const isVM = React.useMemo(
    () =>
      !!hosts.find((host) => {
        const inventory = stringToJSON<Inventory>(host.inventory || '') || {};
        return inventory.systemVendor?.virtual;
      }),
    [hosts],
  );

  return isVM ? (
    <Text component="p">
      <Popover bodyContent={<HintOnReboot />} minWidth="30rem">
        <Button variant={ButtonVariant.link} isInline>
          <InfoCircleIcon size="sm" />
          &nbsp;Check your VM reboot configuration
        </Button>
      </Popover>
      &ensp;
      <Popover bodyContent={<HintVirtInstall />} minWidth="35rem">
        <Button variant={ButtonVariant.link} isInline>
          <InfoCircleIcon size="sm" />
          &nbsp;Using virt-install? Please read this!
        </Button>
      </Popover>
    </Text>
  ) : null;
};

export default VMRebootConfigurationInfo;
