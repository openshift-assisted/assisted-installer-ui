import React from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { getFieldId, PopoverIcon, MCE_LINK } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';

const MCE_FIELD_NAME = 'useMultiClusterEngine';

const MceLabel = ({ disabledReason }: { disabledReason?: string }) => (
  <>
    <Tooltip hidden={!disabledReason} content={disabledReason}>
      <span>Install multicluster engine </span>
    </Tooltip>
    <PopoverIcon
      id={MCE_FIELD_NAME}
      component={'a'}
      headerContent="Additional Requirements"
      bodyContent={
        <>
          OpenShift Data Foundation (recommended for creating additional on-premise clusters) or
          another persistent storage service
        </>
      }
    />
  </>
);

const MceHelperText = () => {
  return (
    <>
      Create, import and manage multiple clusters from this cluster.{' '}
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
