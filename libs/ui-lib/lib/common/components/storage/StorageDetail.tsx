import React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { getInventory } from '../../index';
import { OnDiskRoleType } from '../hosts/DiskRole';
import { DiskFormattingType } from '../hosts/FormatDiskCheckbox';
import { DisksTable } from './DisksTable';
import SectionTitle from '../ui/SectionTitle';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type StorageDetailProps = {
  host: Host;
  canEditDisks?: (host: Host) => boolean;
  onDiskRole?: OnDiskRoleType;
  updateDiskSkipFormatting?: DiskFormattingType;
};

const StorageDetail = ({
  host,
  canEditDisks,
  onDiskRole,
  updateDiskSkipFormatting,
}: StorageDetailProps) => {
  const inventory = getInventory(host);
  const disks = inventory.disks || [];

  const { t } = useTranslation();

  return (
    <Grid hasGutter>
      <SectionTitle
        testId={'disks-section'}
        title={t('ai:{{count}} Disk', { count: disks.length })}
      />
      <GridItem>
        <DisksTable
          testId={'disks-table'}
          canEditDisks={canEditDisks}
          host={host}
          disks={disks}
          installationDiskId={host.installationDiskId}
          onDiskRole={onDiskRole}
          updateDiskSkipFormatting={updateDiskSkipFormatting}
        />
      </GridItem>
    </Grid>
  );
};

export default StorageDetail;
