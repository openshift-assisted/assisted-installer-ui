import React, { useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';

const PIPELINES_FIELD_NAME = 'usePipelines';

const PipelinesLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install Pipelines </span>
      </Tooltip>
      <PopoverIcon
        id={PIPELINES_FIELD_NAME}
        component={'a'}
        bodyContent={'No additional requirements needed'}
      />
      <NewFeatureSupportLevelBadge featureId="PIPELINES" supportLevel={supportLevel} />
    </>
  );
};

const PipelinesHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Cloud-native continuous integration and delivery (CI/CD) solution for building pipelines
        using Tekton.{' '}
      </HelperTextItem>
    </HelperText>
  );
};

const PipelinesCheckbox = ({ disabledReason }: { disabledReason?: string }) => {
  const fieldId = getFieldId(PIPELINES_FIELD_NAME, 'input');
  const featureSupportLevel = useNewFeatureSupportLevel();
  const [disabledReasonPipelines, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    const reason = featureSupportLevel.getFeatureDisabledReason('PIPELINES');
    setDisabledReason(reason);
  }, [featureSupportLevel]);
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={PIPELINES_FIELD_NAME}
        label={
          <PipelinesLabel
            disabledReason={disabledReason ? disabledReason : disabledReasonPipelines}
            supportLevel={featureSupportLevel.getFeatureSupportLevel('PIPELINES')}
          />
        }
        helperText={<PipelinesHelperText />}
        isDisabled={!!disabledReason || !!disabledReasonPipelines}
      />
    </FormGroup>
  );
};

export default PipelinesCheckbox;
