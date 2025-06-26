import React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import {
  Disk,
  DiskRole as DiskRoleValue,
  Host,
} from '@openshift-assisted/types/assisted-installer-service';
import { diskRoleLabels } from '../../config';
import { useStateSafely } from '../../hooks';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { TFunction } from 'i18next';

export const getCurrentDiskRoleLabel = (
  disk: Disk,
  installationDiskId: Host['installationDiskId'],
  t: TFunction,
) => (disk.id === installationDiskId ? diskRoleLabels(t).install : diskRoleLabels(t).none);

export type OnDiskRoleType = (
  hostId: Host['id'],
  diskId: Disk['id'],
  role: DiskRoleValue,
) => Promise<unknown>;

export type DiskRoleProps = {
  host: Host;
  disk: Disk;
  installationDiskId: Host['installationDiskId'];
  isEditable: boolean;
  onDiskRole?: OnDiskRoleType;
};

const DiskRole: React.FC<DiskRoleProps> = ({
  host,
  disk,
  installationDiskId,
  isEditable,
  onDiskRole,
}) => {
  const { t } = useTranslation();
  const currentRoleLabel = getCurrentDiskRoleLabel(disk, installationDiskId, t);
  if (isEditable && disk.id !== installationDiskId && onDiskRole) {
    return (
      <DiskRoleDropdown
        host={host}
        disk={disk}
        installationDiskId={installationDiskId}
        onDiskRole={onDiskRole}
      />
    );
  }
  return <>{currentRoleLabel}</>;
};

type DiskRoleDropdownProps = {
  host: Host;
  disk: Disk;
  installationDiskId: Host['installationDiskId'];
  onDiskRole: OnDiskRoleType;
};

const DiskRoleDropdown: React.FC<DiskRoleDropdownProps> = ({
  host,
  disk,
  installationDiskId,
  onDiskRole,
}) => {
  const [isOpen, setOpen] = useStateSafely(false);
  const [isDisabled, setDisabled] = useStateSafely(false);
  const { t } = useTranslation();
  const dropdownItems = [
    <DropdownItem
      key="install"
      id="install"
      isDisabled={!disk.installationEligibility?.eligible}
      description={
        !disk.installationEligibility?.eligible && t('ai:Disk is not eligible for installation')
      }
    >
      {diskRoleLabels(t).install}
    </DropdownItem>,
  ];

  const onSelect = React.useCallback(
    (event?: React.MouseEvent<Element, MouseEvent>) => {
      const asyncFunc = async () => {
        if (event?.currentTarget.id) {
          setDisabled(true);
          await onDiskRole(host.id, disk.id, event.currentTarget.id as DiskRoleValue);
          setDisabled(false);
        }
        setOpen(false);
      };
      void asyncFunc();
    },
    [setOpen, setDisabled, onDiskRole, host.id, disk.id],
  );

  const currentRoleLabel = getCurrentDiskRoleLabel(disk, installationDiskId, t);
  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      variant="plainText"
      ref={toggleRef}
      isFullWidth
      onClick={() => setOpen(!isOpen)}
      isExpanded={isOpen}
      isDisabled={isDisabled}
    >
      {currentRoleLabel}
    </MenuToggle>
  );

  return (
    <Dropdown
      onOpenChange={() => setOpen(!isOpen)}
      onSelect={onSelect}
      toggle={toggle}
      isOpen={isOpen}
    >
      <DropdownList>{dropdownItems}</DropdownList>
    </Dropdown>
  );
};

export default DiskRole;
