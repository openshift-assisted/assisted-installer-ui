import React from 'react';
import { AlertActionLink } from '@patternfly/react-core';
import { AdditionalNTPSourcesDialog } from '../../../common/components/hosts/AdditionalNTPSourcesDialog';
import { Cluster } from '../../../common';

export const onAdditionalNtpSource = async (additionalNtpSource: string) => {
  console.info('TODO: implement onAdditionalNtpSource for CIM: ', additionalNtpSource);
};

export const AdditionalNTPSourcesDialogToggle: React.FC<{
  additionalNtpSource?: Cluster['additionalNtpSource'];
}> = ({ additionalNtpSource }) => {
  const [isOpen, setOpen] = React.useState(false);
  // TODO(mlibra): Improve position of the dialog in the component hierarchy. Do we want a generic mechanism like in OCM?

  return (
    <>
      <AlertActionLink onClick={() => setOpen(true)}>Add NTP sources</AlertActionLink>
      {isOpen && (
        <AdditionalNTPSourcesDialog
          additionalNtpSource={additionalNtpSource}
          isOpen={isOpen}
          onClose={() => setOpen(false)}
          onAdditionalNtpSource={onAdditionalNtpSource}
        />
      )}
    </>
  );
};
