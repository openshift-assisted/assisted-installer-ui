import React from 'react';
import { FormGroup, List, ListItem, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { getFieldId, PopoverIcon, MCE_LINK } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';

const MCE_FIELD_NAME = 'useMultiClusterEngine';

const MceLabel = ({ disabledReason }: { disabledReason?: string }) => (
  <>
    <Tooltip hidden={!disabledReason} content={disabledReason}>
      <span>Install MultiCluster Engine </span>
    </Tooltip>
    <PopoverIcon
      id={MCE_FIELD_NAME}
      component={'a'}
      headerContent="Additional Requirements for MultiCluster Engine"
      bodyContent={
        <>
          <List>
            <ListItem>Requirement 1</ListItem>
            <ListItem>
              OpenShift Data Foundation (recommended for creating additional on-premise clusters) or
              another persistent storage service
            </ListItem>
          </List>
        </>
      }
    />
  </>
);

const MceHelperText = () => {
  return (
    <>
      Transform your cluster into a cluster lifecycle manager for all your OpenShift clusters.{' '}
      <a href={MCE_LINK} target="_blank" rel="noopener noreferrer">
        {'Learn more'} <ExternalLinkAltIcon />
      </a>
    </>
  );
};

const MceCheckbox = () => {
  const featureSupportLevelContext = useNewFeatureSupportLevel();
  const fieldId = getFieldId(MCE_FIELD_NAME, 'input');
  const disabledReason = featureSupportLevelContext.getFeatureDisabledReason('MCE');
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={MCE_FIELD_NAME}
        label={<MceLabel disabledReason={disabledReason} />}
        isDisabled={!!disabledReason}
        helperText={<MceHelperText />}
      />
    </FormGroup>
  );
};

export default MceCheckbox;
