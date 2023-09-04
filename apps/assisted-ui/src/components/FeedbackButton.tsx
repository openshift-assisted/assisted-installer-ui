import type React from 'react';
import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Constants } from '@openshift-assisted/ui-lib/ocm';

export const FeedbackButton: React.FC = () => (
  <Button
    variant={'plain'}
    onClick={() => window.open(Constants.FEEDBACK_FORM_LINK, '_blank', 'noopener noreferrer')}
    id="button-feedback"
  >
    Provide feedback <ExternalLinkAltIcon />
  </Button>
);
