import React from 'react';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import {
  areOnlySoftValidationsOfWizardStepFailing,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
  HostsTableActions,
  hostStatus,
  HostStatus,
  TableRow,
  stringToJSON,
  useTranslation,
} from '../../../common';
import { ValidationsInfo } from '../../../common/types/hosts';
import { wizardStepsValidationsMap } from '../wizard/utils';
import { AdditionalNTPSourcesDialogToggle } from './components/AdditionaNTPSourceDialogToggle';

type HardwareStatusProps = {
  host: Host;
  validationsInfo: ValidationsInfo;
  onEditHostname?: () => void;
  isWithinModal?: boolean;
  openshiftVersion?: string;
};

const DELETE_MODAL_STATUS_Z_INDEX = 500;

export const HardwareStatus = (props: HardwareStatusProps) => {
  const { t } = useTranslation();
  const hardwareStatus = getWizardStepHostStatus(
    'host-discovery',
    wizardStepsValidationsMap,
    props.host,
  );
  const status = hostStatus(t)[hardwareStatus];
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
      zIndex={props.isWithinModal ? DELETE_MODAL_STATUS_Z_INDEX : undefined}
      status={{ ...status, sublabel }}
      validationsInfo={validationsInfo}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
      openshiftVersion={props.openshiftVersion}
    />
  );
};

export const hardwareStatusColumn = ({
  onEditHostname,
  isWithinModal,
  openshiftVersion,
}: {
  onEditHostname?: HostsTableActions['onEditHost'];
  isWithinModal?: boolean;
  openshiftVersion?: string;
}): TableRow<Host> => {
  return {
    header: {
      title: 'Status',
      props: {
        id: 'col-header-hwstatus',
      },
      sort: true,
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
            isWithinModal={isWithinModal}
            openshiftVersion={openshiftVersion}
          />
        ),
        props: { 'data-testid': 'host-hw-status' },
        sortableValue: status,
      };
    },
  };
};
