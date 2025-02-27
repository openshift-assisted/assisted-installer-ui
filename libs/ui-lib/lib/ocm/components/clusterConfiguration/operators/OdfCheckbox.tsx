import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import {
  getFieldId,
  PopoverIcon,
  ODF_REQUIREMENTS_LINK,
  ODF_LINK,
  OperatorsValues,
} from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';
import { useFormikContext } from 'formik';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';

const ODF_FIELD_NAME = 'useOpenShiftDataFoundation';

const OdfLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => (
  <>
    <Tooltip hidden={!disabledReason} content={disabledReason}>
      <span>Install OpenShift Data Foundation </span>
    </Tooltip>
    <PopoverIcon
      component={'a'}
      headerContent="Additional requirements"
      bodyContent={
        <a href={ODF_REQUIREMENTS_LINK} target="_blank" rel="noopener noreferrer">
          Learn more about the requirements for OpenShift Data Foundation <ExternalLinkAltIcon />.
        </a>
      }
    />
    <NewFeatureSupportLevelBadge featureId="ODF" supportLevel={supportLevel} />
  </>
);

const OdfHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Persistent software-defined storage for hybrid applications.{' '}
        <a href={ODF_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const OdfCheckbox = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const { setFieldValue } = useFormikContext<OperatorsValues>();
  const featureSupportLevelData = useNewFeatureSupportLevel();
  const fieldId = getFieldId(ODF_FIELD_NAME, 'input');
  const selectLsoOperator = (checked: boolean) => {
    if (featureSupportLevelData.isFeatureSupported('LSO')) setFieldValue('useLso', checked);
  };
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={ODF_FIELD_NAME}
        label={<OdfLabel disabledReason={disabledReason} supportLevel={supportLevel} />}
        isDisabled={!!disabledReason}
        helperText={<OdfHelperText />}
        onChange={selectLsoOperator}
      />
    </FormGroup>
  );
};

export default OdfCheckbox;
