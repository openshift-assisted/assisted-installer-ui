import React, { useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';

const SERVERLESS_FIELD_NAME = 'useServerless';

const ServerlessLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install Serverless </span>
      </Tooltip>
      <PopoverIcon
        id={SERVERLESS_FIELD_NAME}
        component={'a'}
        bodyContent={'No additional requirements needed'}
      />
      <NewFeatureSupportLevelBadge featureId="SERVERLESS" supportLevel={supportLevel} />
    </>
  );
};

const ServerlessHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Deploy workflow applications based on the CNCF Serverless Workflow specification.{' '}
      </HelperTextItem>
    </HelperText>
  );
};

const ServerlessCheckbox = ({ disabledReason }: { disabledReason?: string }) => {
  const fieldId = getFieldId(SERVERLESS_FIELD_NAME, 'input');
  const featureSupportLevel = useNewFeatureSupportLevel();
  const [disabledReasonServerless, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    const reason = featureSupportLevel.getFeatureDisabledReason('SERVERLESS');
    setDisabledReason(reason);
  }, [featureSupportLevel]);
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={SERVERLESS_FIELD_NAME}
        label={
          <ServerlessLabel
            disabledReason={disabledReason ? disabledReason : disabledReasonServerless}
            supportLevel={featureSupportLevel.getFeatureSupportLevel('SERVERLESS')}
          />
        }
        helperText={<ServerlessHelperText />}
        isDisabled={!!disabledReason || !!disabledReasonServerless}
      />
    </FormGroup>
  );
};

export default ServerlessCheckbox;
