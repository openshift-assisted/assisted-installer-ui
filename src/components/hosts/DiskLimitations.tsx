import React from 'react';
import { Alert, AlertVariant, Button, ButtonVariant, Popover } from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { Disk } from '../../api/types';

type DiskLimitationsProps = {
  disk: Disk;
};
const DiskLimitations: React.FC<DiskLimitationsProps> = ({ disk }) => {
  if (!disk.installationEligibility?.eligible) {
    return (
      <Popover
        headerContent={<div>Disk limitations</div>}
        bodyContent={<DiskLimitationsPopoverContent {...disk.installationEligibility} />}
        minWidth="30rem"
        maxWidth="50rem"
      >
        <Button
          variant={ButtonVariant.link}
          icon={<WarningTriangleIcon color={warningColor.value} />}
          isInline
        >
          Limitations
        </Button>
      </Popover>
    );
  }
  return null;
};

export default DiskLimitations;

type DiskLimitationsPopoverContentProps = {
  eligible?: boolean;
  notEligibleReasons?: string[];
};

const DiskLimitationsPopoverContent: React.FC<DiskLimitationsPopoverContentProps> = ({
  eligible,
  notEligibleReasons,
}) => {
  const alerts = [];

  if (!eligible) {
    alerts.push(
      <Alert
        key="install-eligibility"
        variant={AlertVariant.warning}
        title="Disk is not eligible for installation"
        isInline
      >
        {notEligibleReasons && (
          <ul>
            {notEligibleReasons.map((reason: string) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
      </Alert>,
    );
  }
  return <>{alerts}</>;
};
