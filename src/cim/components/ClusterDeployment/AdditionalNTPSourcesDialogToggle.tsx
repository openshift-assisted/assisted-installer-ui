import React from 'react';

// TODO we should use HOST_VALIDATION_FAILURE_HINTS instead of passing this 'action' which is actually a hint
export const AdditionalNTPSourcesDialogToggle: React.FC = () => (
  <>
    NTP sources can be edited in Host's Infrastructure environment. After updating the NTP sources,
    make sure to restart the host.
  </>
);
