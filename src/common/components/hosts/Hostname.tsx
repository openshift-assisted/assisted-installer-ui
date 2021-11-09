import React from 'react';
import { Button, ButtonVariant, Flex, FlexItem, Popover } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { Host, Inventory, stringToJSON } from '../../api';
import { getHostname } from './utils';
import { DASH } from '../constants';

type HostnameProps = {
  host: Host;
  onEditHostname?: () => void;
  className?: string;
  // Provide either inventory or title
  inventory?: Inventory;
  title?: string;
  hosts?: Host[];
  readonly?: boolean;
};

const Hostname: React.FC<HostnameProps> = ({
  host,
  inventory = {},
  onEditHostname,
  title,
  className,
  hosts,
  readonly = false,
}) => {
  const hostname = title || getHostname(host, inventory) || DASH;
  const isHostnameChangeRequested = !title && host.requestedHostname !== inventory.hostname;

  const isNotLocalhost = hostname !== 'localhost';
  const isUnique = hosts
    ? !hosts.find((h) => {
        const hostInventory = stringToJSON<Inventory>(h.inventory || '') || {};
        return h.id !== host.id && getHostname(h, hostInventory) === hostname;
      })
    : true;

  const isValid = isUnique && isNotLocalhost;

  const body = (
    <Flex alignItems={{ default: 'alignItemsCenter' }}>
      {onEditHostname && !isValid && (
        <FlexItem className={'pf-u-mr-xs'}>
          <ExclamationTriangleIcon color={warningColor.value} />
        </FlexItem>
      )}
      <FlexItem>
        {hostname}
        {isHostnameChangeRequested && ' *'}
      </FlexItem>
    </Flex>
  );

  return onEditHostname ? (
    isValid ? (
      !readonly ? (
        <Button
          variant={ButtonVariant.link}
          isInline
          onClick={onEditHostname}
          className={className}
        >
          {body}
        </Button>
      ) : (
        body
      )
    ) : (
      <Popover
        headerContent={
          <Flex alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem className={'pf-u-mr-xs'}>
              <ExclamationTriangleIcon color={warningColor.value} />
            </FlexItem>
            <FlexItem>Hostname is not valid</FlexItem>
          </Flex>
        }
        bodyContent={!isNotLocalhost ? 'Hostname can not be localhost' : 'Hostname is not unique'}
        footerContent={
          <Button
            variant={ButtonVariant.link}
            isInline
            className={className}
            onClick={onEditHostname}
          >
            Change hostname
          </Button>
        }
        minWidth="30rem"
        maxWidth="50rem"
        hideOnOutsideClick
        zIndex={300}
      >
        <Button variant={ButtonVariant.link} isInline className={className}>
          {body}
        </Button>
      </Popover>
    )
  ) : (
    body
  );
};
export default Hostname;
