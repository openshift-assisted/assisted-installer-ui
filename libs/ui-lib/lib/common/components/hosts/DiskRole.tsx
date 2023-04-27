import React from 'react';
import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { Disk, DiskRole as DiskRoleValue, Host } from '../../api';
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
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
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
  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(val) => setOpen(val)}
        toggleIndicator={CaretDownIcon}
        isDisabled={isDisabled}
        className="pf-c-button pf-m-link pf-m-inline"
      >
        {currentRoleLabel}
      </DropdownToggle>
    ),
    [setOpen, currentRoleLabel, isDisabled],
  );

  return (
    <Dropdown
      onSelect={onSelect}
      dropdownItems={dropdownItems}
      toggle={toggle}
      isOpen={isOpen}
      isPlain
    />
  );
};

export default DiskRole;
