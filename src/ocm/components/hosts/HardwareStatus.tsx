import { sortable } from '@patternfly/react-table';
import React from 'react';
import {
  areOnlySoftValidationsOfWizardStepFailing,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
  Host,
  HostsTableActions,
  hostStatus,
  HostStatus,
  stringToJSON,
} from '../../../common';
import { TableRow } from '../../../common/components/hosts/AITable';
import { ValidationsInfo } from '../../../common/types/hosts';
import { wizardStepsValidationsMap } from '../clusterWizard/wizardTransition';
import { AdditionalNTPSourcesDialogToggle } from './AdditionaNTPSourceDialogToggle';

type HardwareStatusProps = {
  host: Host;
  validationsInfo: ValidationsInfo;
  onEditHostname?: () => void;
  zIndex?: number;
};

const HardwareStatus = (props: HardwareStatusProps) => {
  const hardwareStatus = getWizardStepHostStatus(
    'host-discovery',
    wizardStepsValidationsMap,
    props.host,
  );
  const status = hostStatus[hardwareStatus];
  const validationsInfo = getWizardStepHostValidationsInfo(
    props.validationsInfo,
    'host-discovery',
    wizardStepsValidationsMap,
  );
  const sublabel = areOnlySoftValidationsOfWizardStepFailing(
    validationsInfo,
    'host-discovery',
    wizardStepsValidationsMap,
  )
    ? 'Some validations failed'
    : undefined;

  return (
    <HostStatus
      {...props}
      status={{ ...status, sublabel }}
      validationsInfo={validationsInfo}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
    />
  );
};

export const hardwareStatusColumn = ({
  onEditHostname,
  zIndex,
}: {
  onEditHostname?: HostsTableActions['onEditHost'];
  zIndex?: number;
}): TableRow<Host> => {
  return {
    header: {
      title: 'Status',
      props: {
        id: 'col-header-hwstatus',
      },
      transforms: [sortable],
    },
    cell: (host) => {
      const validationsInfo = stringToJSON<ValidationsInfo>(host.validationsInfo) || {};
      const editHostname = onEditHostname ? () => onEditHostname(host) : undefined;
      return {
        title: (
          <HardwareStatus
            host={host}
            onEditHostname={editHostname}
            validationsInfo={validationsInfo}
            zIndex={zIndex}
          />
        ),
        props: { 'data-testid': 'host-hw-status' },
        sortableValue: status,
      };
    },
  };
};

export default { HardwareStatus, hardwareStatusColumn };
