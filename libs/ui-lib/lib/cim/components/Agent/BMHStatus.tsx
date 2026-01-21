import { Button, Popover } from '@patternfly/react-core';
import * as React from 'react';
import { getBMHStatus } from '../helpers/status';
import { BareMetalHostK8sResource } from '../../types';
import { BMHStatusInfo } from './BMHStatusInfo';

type BMHStatusProps = {
  bmhStatus: ReturnType<typeof getBMHStatus>;
  bmh: BareMetalHostK8sResource;
};

const BMHStatus: React.FC<BMHStatusProps> = ({ bmhStatus, bmh }) => (
  <Popover
    aria-label="Bare metal host status details"
    bodyContent={<BMHStatusInfo bmhStatus={bmhStatus} bmh={bmh} />}
    minWidth="30rem"
    maxWidth="50rem"
    hideOnOutsideClick
    zIndex={300}
  >
    <Button variant="link" isInline>
      {bmhStatus.state.title}
    </Button>
  </Popover>
);

export default BMHStatus;
