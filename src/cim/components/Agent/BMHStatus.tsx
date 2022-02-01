import { Button, Popover } from '@patternfly/react-core';
import * as React from 'react';
import { getBMHStatus } from '../helpers/status';

type BMHStatusProps = {
  bmhStatus: ReturnType<typeof getBMHStatus>;
};

const BMHStatus: React.FC<BMHStatusProps> = ({ bmhStatus }) =>
  bmhStatus.message ? (
    <Popover
      headerContent="Error"
      bodyContent={bmhStatus.message}
      minWidth="30rem"
      maxWidth="50rem"
      hideOnOutsideClick
      zIndex={300}
    >
      <Button variant="link" isInline>
        {bmhStatus.title}
      </Button>
    </Popover>
  ) : (
    <>{bmhStatus.title || '--'}</>
  );

export default BMHStatus;
