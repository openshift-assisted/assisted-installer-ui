import { Button, Popover } from '@patternfly/react-core';
import * as React from 'react';
import { getBMHStatus } from '../helpers/status';

type BMHStatusProps = {
  bmhStatus: ReturnType<typeof getBMHStatus>;
};

const BMHStatus: React.FC<BMHStatusProps> = ({ bmhStatus }) =>
  bmhStatus.errorMessage ? (
    <Popover
      headerContent="Error"
      bodyContent={bmhStatus.errorMessage}
      minWidth="30rem"
      maxWidth="50rem"
      hideOnOutsideClick
      zIndex={300}
    >
      <Button variant="link" isInline>
        {bmhStatus.state.title}
      </Button>
    </Popover>
  ) : (
    <>{bmhStatus.state.title}</>
  );

export default BMHStatus;
