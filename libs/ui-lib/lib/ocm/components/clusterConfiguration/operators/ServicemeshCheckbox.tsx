import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, getServiceMeshLink, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

const SERVICEMESH_FIELD_NAME = 'useServicemesh';

const ServiceMeshLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install Service Mesh </span>
      </Tooltip>
      <PopoverIcon
        id={SERVICEMESH_FIELD_NAME}
        component={'a'}
        bodyContent={'No additional requirements needed'}
      />
      <NewFeatureSupportLevelBadge featureId="SERVICEMESH" supportLevel={supportLevel} />
    </>
  );
};

const ServiceMeshHelperText = ({ openshiftVersion }: { openshiftVersion?: string }) => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Platform that provides behavioral insight and operational control over a service mesh.{' '}
        <a href={getServiceMeshLink(openshiftVersion)} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const ServiceMeshCheckbox = ({
  disabledReason,
  supportLevel,
  openshiftVersion,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
  openshiftVersion?: string;
}) => {
  const fieldId = getFieldId(SERVICEMESH_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={SERVICEMESH_FIELD_NAME}
        label={<ServiceMeshLabel disabledReason={disabledReason} supportLevel={supportLevel} />}
        helperText={<ServiceMeshHelperText openshiftVersion={openshiftVersion || '4.17'} />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default ServiceMeshCheckbox;
