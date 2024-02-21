import React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { TableVariant, RowWrapperProps, RowWrapper, IRow } from '@patternfly/react-table';
import { Table, TableHeader, TableBody } from '@patternfly/react-table/deprecated';
import { ExtraParamsType } from '@patternfly/react-table/dist/js/components/Table/base/types';
import { DetailItem, DetailList, DetailListProps } from '../ui';
import type { Disk, Host, Interface } from '@openshift-assisted/types/assisted-installer-service';
import type { ValidationsInfo } from '../../types/hosts';
import type { WithTestID } from '../../types/index';
import { DASH } from '../constants';
import { getHostRowHardwareInfo } from './hardwareInfo';
import { getHardwareTypeText, getInventory } from './utils';
import type { ValidationInfoActionProps } from './HostValidationGroups';
import NtpValidationStatus from './NtpValidationStatus';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import SectionTitle from '../ui/SectionTitle';
import { OnDiskRoleType } from './DiskRole';
import StorageDetail from '../storage/StorageDetail';
import { stringToJSON } from '../../utils';
import { TFunction } from 'i18next';

type HostDetailProps = {
  host: Host;
  canEditDisks?: (host: Host) => boolean;
  onDiskRole?: OnDiskRoleType;
  AdditionalNTPSourcesDialogToggleComponent?: ValidationInfoActionProps['AdditionalNTPSourcesDialogToggleComponent'];
  hideNTPStatus?: boolean;
  updateDiskSkipFormatting?: (
    shouldFormatDisk: boolean,
    hostId: Host['id'],
    diskId: Disk['id'],
  ) => Promise<unknown>;
};

type SectionColumnProps = {
  children: DetailListProps['children'];
};

type NicsTableProps = {
  interfaces: Interface[];
};

const SectionColumn: React.FC<SectionColumnProps> = ({ children }) => (
  <GridItem span={4}>
    <DetailList>{children}</DetailList>
  </GridItem>
);

const nicsColumns = (t: TFunction) => [
  { title: t('ai:Name') },
  { title: t('ai:MAC address') },
  { title: t('ai:IPv4 address') },
  { title: t('ai:IPv6 address') },
  { title: t('ai:Speed') },
  // { title: 'Vendor' }, TODO(mlibra): search HW database for humanized values
  // { title: 'Product' },
];

// eslint-disable-next-line
const nicsRowKey = ({ rowData }: ExtraParamsType) => rowData?.name?.title;

const NICsTableRowWrapper = (props: RowWrapperProps) => (
  <RowWrapper {...props} data-testid={`nic-row:${(props?.row?.key as string) || ''}`} />
);

const NicsTable: React.FC<NicsTableProps & WithTestID> = ({ interfaces, testId }) => {
  const { t } = useTranslation();
  const rows: IRow[] = interfaces
    .sort((nicA, nicB) => nicA.name?.localeCompare(nicB.name || '') || 0)
    .map((nic) => ({
      cells: [
        { title: nic.name, props: { 'data-testid': 'nic-name' } },
        { title: nic.macAddress, props: { 'data-testid': 'nic-mac' } },
        {
          title: (nic.ipv4Addresses || []).join(', '),
          props: { 'data-testid': 'nic-ipv4' },
        },
        {
          title: (nic.ipv6Addresses || []).join(', '),
          props: { 'data-testid': 'nic-ipv6' },
        },
        {
          title: nic.speedMbps && nic.speedMbps > 0 ? `${nic.speedMbps} Mbps` : 'N/A',
          props: { 'data-testid': 'nic-speed' },
        },
      ],
      key: nic.name,
    }));

  return (
    <Table
      data-testid={testId}
      rows={rows}
      cells={nicsColumns(t)}
      variant={TableVariant.compact}
      aria-label={t("ai:Host's network interfaces table")}
      borders={false}
      rowWrapper={NICsTableRowWrapper}
    >
      <TableHeader />
      <TableBody rowKey={nicsRowKey} />
    </Table>
  );
};

export const HostDetail = ({
  host,
  canEditDisks,
  onDiskRole,
  AdditionalNTPSourcesDialogToggleComponent,
  hideNTPStatus = false,
  updateDiskSkipFormatting,
}: HostDetailProps) => {
  const { t } = useTranslation();
  const { id, validationsInfo: hostValidationsInfo } = host;
  const inventory = getInventory(host);
  const validationsInfo = React.useMemo(
    () => stringToJSON<ValidationsInfo>(hostValidationsInfo) || {},
    [hostValidationsInfo],
  );
  const rowInfo = getHostRowHardwareInfo(inventory);
  const nics = inventory.interfaces || [];

  let bmcAddress = inventory.bmcAddress;
  if (inventory.bmcV6address) {
    bmcAddress = bmcAddress ? `${bmcAddress}, ${inventory.bmcV6address}` : inventory.bmcV6address;
  }
  bmcAddress = bmcAddress || DASH;

  const hardwareType = getHardwareTypeText(inventory, t);

  const ntpValidationStatus = React.useMemo(
    () => (
      <NtpValidationStatus
        AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleComponent}
        validationsInfo={validationsInfo}
      />
    ),
    [AdditionalNTPSourcesDialogToggleComponent, validationsInfo],
  );

  return (
    <Grid hasGutter>
      <SectionTitle testId={'host-details-section'} title={t('ai:Host details')} />
      <SectionColumn>
        <DetailItem testId={'uuid'} title={t('ai:UUID')} value={id} />
        <DetailItem
          testId={'manufacturer'}
          title={t('ai:Manufacturer')}
          value={inventory.systemVendor?.manufacturer || DASH}
        />
        <DetailItem
          testId={'product'}
          title={t('ai:Product')}
          value={inventory.systemVendor?.productName || DASH}
        />
        <DetailItem
          testId={'serial-number'}
          title={t('ai:Serial number')}
          value={rowInfo.serialNumber}
        />
      </SectionColumn>
      <SectionColumn>
        <DetailItem
          testId={'memory-capacity'}
          title={t('ai:Memory capacity')}
          value={rowInfo.memory.title}
        />
        <DetailItem
          testId={'cpu-model'}
          title={t('ai:CPU model name')}
          value={inventory.cpu?.modelName || DASH}
        />
        <DetailItem
          testId={'cpu-cores-and-clock'}
          title={t('ai:CPU cores and clock speed')}
          value={rowInfo.cpuSpeed}
        />
        <DetailItem
          testId={'cpu-arch'}
          title={t('ai:CPU architecture')}
          value={inventory.cpu?.architecture || DASH}
        />
      </SectionColumn>
      <SectionColumn>
        <DetailItem testId={'hw-type'} title={t('ai:Hardware type')} value={hardwareType} />
        <DetailItem testId={'bmc-address'} title={t('ai:BMC address')} value={bmcAddress} />
        <DetailItem
          testId={'boot-mode'}
          title={t('ai:Boot mode')}
          value={inventory.boot?.currentBootMode || DASH}
        />
        {inventory.boot?.pxeInterface && (
          <DetailItem
            testId={'pxe-interface'}
            title={t('ai:PXE interface')}
            value={inventory.boot?.pxeInterface}
          />
        )}
        <DetailItem
          isHidden={hideNTPStatus}
          testId={'ntp-status'}
          title={t('ai:NTP status')}
          value={ntpValidationStatus}
        />
      </SectionColumn>
      <StorageDetail
        host={host}
        onDiskRole={onDiskRole}
        canEditDisks={canEditDisks}
        updateDiskSkipFormatting={updateDiskSkipFormatting}
      />
      <SectionTitle testId={'nics-section'} title={t('ai:NIC', { count: nics.length })} />
      <GridItem>
        <NicsTable interfaces={nics} testId={'nics-table'} />
      </GridItem>
    </Grid>
  );
};
