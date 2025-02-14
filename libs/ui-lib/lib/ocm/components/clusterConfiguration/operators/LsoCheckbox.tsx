import React, { useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
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

const LsoCheckbox = ({ disabledReason }: { disabledReason?: string }) => {
  const fieldId = getFieldId(LSO_FIELD_NAME, 'input');
  const featureSupportLevel = useNewFeatureSupportLevel();
  const [disabledReasonLso, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    const reason = featureSupportLevel.getFeatureDisabledReason('LSO');
    setDisabledReason(reason);
  }, [featureSupportLevel]);
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={LSO_FIELD_NAME}
        label={
          <LsoLabel
            disabledReason={disabledReason ? disabledReason : disabledReasonLso}
            supportLevel={featureSupportLevel.getFeatureSupportLevel('LSO')}
          />
        }
        helperText={<LsoHelperText />}
        isDisabled={!!disabledReason || !!disabledReasonLso}
      />
    </FormGroup>
  );
};

export default LsoCheckbox;
