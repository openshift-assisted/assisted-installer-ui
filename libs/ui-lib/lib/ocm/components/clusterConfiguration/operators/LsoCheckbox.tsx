import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, getLsoLink, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

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

const LsoHelperText = ({ openshiftVersion }: { openshiftVersion?: string }) => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Allows provisioning of persistent storage by using local volumes.{' '}
        <a href={getLsoLink(openshiftVersion)} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const LsoCheckbox = ({
  disabledReason,
  supportLevel,
  openshiftVersion,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
  openshiftVersion?: string;
}) => {
  const fieldId = getFieldId(LSO_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={LSO_FIELD_NAME}
        label={<LsoLabel disabledReason={disabledReason} supportLevel={supportLevel} />}
        helperText={<LsoHelperText openshiftVersion={openshiftVersion || '4.17'} />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default LsoCheckbox;
