import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';

const LSO_FIELD_NAME = 'useLso';

const LsoLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install Local Storage Operator </span>
      </Tooltip>
      <PopoverIcon
        id={LSO_FIELD_NAME}
        component={'a'}
        bodyContent={'No additional requirements needed'}
      />
      <NewFeatureSupportLevelBadge featureId="LSO" supportLevel={supportLevel} />
    </>
  );
};

const LsoHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Allows provisioning of persistent storage by using local volumes.{' '}
      </HelperTextItem>
    </HelperText>
  );
};

const LsoCheckbox = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const fieldId = getFieldId(LSO_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={LSO_FIELD_NAME}
        label={<LsoLabel disabledReason={disabledReason} supportLevel={supportLevel} />}
        helperText={<LsoHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default LsoCheckbox;
