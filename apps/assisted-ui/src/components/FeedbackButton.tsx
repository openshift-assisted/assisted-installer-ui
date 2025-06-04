import type React from 'react';
import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { Constants } from '@openshift-assisted/ui-lib/ocm';

export const FeedbackButton: React.FC = () => (
  <Button icon={<>
    Provide feedback <ExternalLinkAltIcon />
  </>}
    variant={'plain'}
    onClick={() => window.open(Constants.FEEDBACK_FORM_LINK, '_blank', 'noopener noreferrer')}
    id="button-feedback"
   />
);
