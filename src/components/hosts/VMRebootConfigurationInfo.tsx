import React from 'react';
import { Button, ButtonVariant, Popover, Text, TextVariants } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { Host, stringToJSON, Inventory } from '../../api';

const Hint = () => (
  <>
    <Text component={TextVariants.p}>
      Your libvirt virtual machines should be configured to restart automatically after a reboot.
      You can check this by running:
    </Text>
    <Text component={TextVariants.p}>
      <code>
        virsh dumpxml {'<'}name{'>'} | grep on_reboot{' '}
      </code>
    </Text>
    <Text component={TextVariants.p}>And verify that this is the output:</Text>
    <Text component={TextVariants.p}>
      <code>
        {'<'}on_reboot{'>'}restart{'</'}on_reboot{'>'}
      </code>
    </Text>
    <Text component={TextVariants.p}>
      If not, please start your VMs with the following configuration:
    </Text>
    <Text component={TextVariants.p}>
      <code>--events on_reboot=restart</code>
    </Text>
  </>
);

const VMRebootConfigurationInfo: React.FC<{ hosts?: Host[] }> = ({ hosts = [] }) => {
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
      <Popover bodyContent={<Hint />} minWidth="30rem">
        <Button variant={ButtonVariant.link} isInline>
          <ExclamationTriangleIcon className="status-icon" color={warningColor.value} size="sm" />
          &nbsp;Please check the reboot configuration of your VMs
        </Button>
      </Popover>
    </Text>
  ) : null;
};

export default VMRebootConfigurationInfo;
