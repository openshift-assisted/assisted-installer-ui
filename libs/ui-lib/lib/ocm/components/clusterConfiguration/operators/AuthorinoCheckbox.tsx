import React, { useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';

const AUTHORINO_FIELD_NAME = 'useAuthorino';

const AuthorinoLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install Authorino </span>
      </Tooltip>
      <PopoverIcon
        id={AUTHORINO_FIELD_NAME}
        component={'a'}
        bodyContent={'No additional requirements needed'}
      />
      <NewFeatureSupportLevelBadge featureId="AUTHORINO" supportLevel={supportLevel} />
    </>
  );
};

const AuthorinoHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Lightweigth external authorization service for tailor-made Zero Trust API security.{' '}
      </HelperTextItem>
    </HelperText>
  );
};

const AuthorinoCheckbox = ({ disabledReason }: { disabledReason?: string }) => {
  const fieldId = getFieldId(AUTHORINO_FIELD_NAME, 'input');
  const featureSupportLevel = useNewFeatureSupportLevel();
  const [disabledReasonAuthorino, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    const reason = featureSupportLevel.getFeatureDisabledReason('AUTHORINO');
    setDisabledReason(reason);
  }, [featureSupportLevel]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={AUTHORINO_FIELD_NAME}
        label={
          <AuthorinoLabel
            disabledReason={disabledReason ? disabledReason : disabledReasonAuthorino}
            supportLevel={featureSupportLevel.getFeatureSupportLevel('AUTHORINO')}
          />
        }
        helperText={<AuthorinoHelperText />}
        isDisabled={!!disabledReason || !!disabledReasonAuthorino}
      />
    </FormGroup>
  );
};

export default AuthorinoCheckbox;
