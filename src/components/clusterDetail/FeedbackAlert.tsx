import React from 'react';
import { Alert, AlertActionLink, AlertVariant, GridItem } from '@patternfly/react-core';
import { FEEDBACK_FORM_LINK } from '../../config/constants';

const FeedbackAlert: React.FC = () => (
  <GridItem lg={11} xl={10} xl2={7}>
    <Alert
      variant={AlertVariant.info}
      title="Please let us know what you think"
      actionLinks={
        <>
          <AlertActionLink
            onClick={() => window.open(FEEDBACK_FORM_LINK, '_blank', 'noopener noreferrer')}
          >
            Provide feedback
          </AlertActionLink>
        </>
      }
      isInline
    >
      This assisted installer is actively being developed and your feedback would be greatly
      appreciated. Consider filling out our brief survey.
    </Alert>
  </GridItem>
);

export default FeedbackAlert;
