import * as React from 'react';
import { Alert, AlertVariant, List, ListItem, Stack, StackItem } from '@patternfly/react-core';
import { Cluster, Host } from '@openshift-assisted/types/assisted-installer-service';
import {
  FormatDiskWarning,
  getInventory,
  hasEnabledOperators,
  OPERATOR_NAME_LVM,
  OPERATOR_NAME_ODF,
  getDiskLimitation,
} from '../../../../../common';
import { isAddHostsCluster } from '../../../clusters';

const isSomeDisksSkipFormatting = (cluster: Cluster) => {
  return cluster.hosts?.some(
    (host) => host.skipFormattingDisks && host.skipFormattingDisks.length > 0,
  );
};

export const StorageAlerts = ({ cluster }: { cluster: Cluster }) => {
  const showFormattingHint =
    (hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_ODF) ||
      hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_LVM)) &&
    !isAddHostsCluster(cluster);
  const someDisksAreSkipFormatting = isSomeDisksSkipFormatting(cluster);

  const diskLimitations = [...(cluster.hosts as Host[])]
    ?.sort(
      (a, b) =>
        (a.requestedHostname && a.requestedHostname.localeCompare(b.requestedHostname as string)) ||
        0,
    )
    ?.map((host) => {
      const disks = getInventory(host).disks || [];
      const installationDisk = disks.find((disk) => disk.id === host.installationDiskId);
      if (installationDisk) {
        const holder = disks.find((d) =>
          installationDisk.holders?.split(',').includes(d.name as string),
        );

        if (holder) {
          return getDiskLimitation(installationDisk.name, host.requestedHostname, holder);
        }
      }
    })
    .filter(Boolean);

  return (
    <Stack hasGutter>
      {!!diskLimitations.length && (
        <StackItem>
          {diskLimitations?.length === 1 ? (
            <Alert
              title={diskLimitations[0]}
              isInline
              variant={AlertVariant.warning}
              data-testid="diskLimitationsAlert"
            />
          ) : (
            <Alert
              title="Installation disk limitations"
              isInline
              variant={AlertVariant.warning}
              data-testid="diskLimitationsAlert"
            >
              <List>
                {diskLimitations.map((warning, index) => (
                  <ListItem key={`installationWarning-${index}`}>{warning}</ListItem>
                ))}
              </List>
            </Alert>
          )}
        </StackItem>
      )}
      {showFormattingHint && (
        <StackItem>
          <Alert
            variant={AlertVariant.warning}
            isInline
            title="Make sure you format all non-installation disks"
          >
            All non-installation disks will be used for local storage and must be formatted before
            the storage operator's installation.
          </Alert>
        </StackItem>
      )}
      <StackItem>
        <FormatDiskWarning someDisksAreSkipFormatting={someDisksAreSkipFormatting} />
      </StackItem>
    </Stack>
  );
};
