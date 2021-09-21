import React from 'react';
import PopoverIcon from '../../../common/components/ui/PopoverIcon';

const AgentsSelectionHostCountLabelIcon = () => (
  <PopoverIcon
    position="right"
    bodyContent={<>Total count of hosts to be included in the cluster.</>}
  />
);

export default AgentsSelectionHostCountLabelIcon;
