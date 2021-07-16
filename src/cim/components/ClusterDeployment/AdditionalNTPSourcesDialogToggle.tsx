import React from 'react';
import { AlertActionLink } from '@patternfly/react-core';
import { AdditionalNTPSourcesDialog } from '../../../common/components/hosts/AdditionalNTPSourcesDialog';
import { Cluster } from '../../../common';

export const onAdditionalNtpSource = async (additionalNtpSource: string) => {
  console.info('TODO: implement onAdditionalNtpSource for CIM: ', additionalNtpSource);
};

export const AdditionalNTPSourcesDialogToggle: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const [isOpen, setOpen] = React.useState(false);
  // TODO(mlibra): Improve position of the dialog in the component hierarchy. Do we want a generic mechanism like in OCM?

  return (
    <>
      <AlertActionLink onClick={() => open()}>Add NTP sources</AlertActionLink>;
      <AdditionalNTPSourcesDialog
        cluster={cluster}
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        onAdditionalNtpSource={onAdditionalNtpSource}
      />
    </>
  );
};
