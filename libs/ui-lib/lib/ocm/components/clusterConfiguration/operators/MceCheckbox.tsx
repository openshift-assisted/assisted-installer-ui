import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { getFieldId, PopoverIcon, MCE_LINK } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';

const MCE_FIELD_NAME = 'useMultiClusterEngine';

const MceLabel = ({
  disabledReason,
  showMessageForLvms,
  isSNO,
}: {
  disabledReason?: string;
  showMessageForLvms?: boolean;
  isSNO?: boolean;
}) => {
  const odfText = !isSNO
    ? 'OpenShift Data Foundation (recommended for creating additional on-premise clusters)'
    : '';
  const lvmsText = showMessageForLvms
    ? !isSNO
      ? ', Logical Volume Manager Storage'
      : 'Logical Volume Manager Storage'
    : '';

  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install multicluster engine </span>
      </Tooltip>
      <PopoverIcon
        id={MCE_FIELD_NAME}
        component={'a'}
        headerContent="Additional requirements"
        bodyContent={
          <>
            {odfText}
            {lvmsText} or another persistent storage service
          </>
        }
      />
    </>
  );
};

const MceHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Create, import, and manage multiple clusters from this cluster.{' '}
        <a href={MCE_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const MceCheckbox = ({
  showMessageForLvms,
  isSNO,
}: {
  showMessageForLvms: boolean;
  isSNO: boolean;
}) => {
  const featureSupportLevelContext = useNewFeatureSupportLevel();
  const fieldId = getFieldId(MCE_FIELD_NAME, 'input');
  const disabledReason = featureSupportLevelContext.getFeatureDisabledReason('MCE');
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={MCE_FIELD_NAME}
        label={
          <MceLabel
            disabledReason={disabledReason}
            showMessageForLvms={showMessageForLvms}
            isSNO={isSNO}
          />
        }
        isDisabled={!!disabledReason}
        helperText={<MceHelperText />}
      />
    </FormGroup>
  );
};

export default MceCheckbox;
