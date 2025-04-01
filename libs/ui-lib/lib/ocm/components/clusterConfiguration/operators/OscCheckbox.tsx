import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { getFieldId, PopoverIcon, OSC_REQUIREMENTS_LINK, OSC_LINK } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/assisted-installer-service';

const OSC_FIELD_NAME = 'useOsc';

type OscLabelProps = {
  disabledReason?: string;
  supportLevel?: SupportLevel;
};

const OscLabel = ({ disabledReason, supportLevel }: OscLabelProps) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>OpenShift sandboxed containers </span>
      </Tooltip>
      <PopoverIcon
        component={'a'}
        headerContent="Additional requirements"
        bodyContent={
          <a href={OSC_REQUIREMENTS_LINK} target="_blank" rel="noopener noreferrer">
            Learn more about the requirements for OpenShift sandboxed containers{' '}
            <ExternalLinkAltIcon />.
          </a>
        }
      />
      <NewFeatureSupportLevelBadge featureId="OSC" supportLevel={supportLevel} />
    </>
  );
};

const OscHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        OpenShift sandboxed containers support for OpenShift Container Platform provides users with
        built-in support for running Kata Containers as an additional optional runtime. It provides
        an additional virtualization machine(VM) isolation layer for pods.{' '}
        <a href={OSC_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const OscCheckbox = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const fieldId = getFieldId(OSC_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={OSC_FIELD_NAME}
        label={<OscLabel disabledReason={disabledReason} supportLevel={supportLevel} />}
        isDisabled={!!disabledReason}
        helperText={<OscHelperText />}
      />
    </FormGroup>
  );
};

export default OscCheckbox;
