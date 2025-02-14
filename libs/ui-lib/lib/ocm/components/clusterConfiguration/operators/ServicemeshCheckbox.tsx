import React, { useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelContext';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';

const SERVICEMESH_FIELD_NAME = 'useServiceMesh';

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

const ServiceMeshHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Platform that provides behavioral insight and operational control over a service mesh.{' '}
      </HelperTextItem>
    </HelperText>
  );
};

const ServiceMeshCheckbox = ({ disabledReason }: { disabledReason?: string }) => {
  const fieldId = getFieldId(SERVICEMESH_FIELD_NAME, 'input');
  const featureSupportLevel = useNewFeatureSupportLevel();
  const [disabledReasonServicemesh, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    const reason = featureSupportLevel.getFeatureDisabledReason('SERVICEMESH');
    setDisabledReason(reason);
  }, [featureSupportLevel]);
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={SERVICEMESH_FIELD_NAME}
        label={
          <ServiceMeshLabel
            disabledReason={disabledReason ? disabledReason : disabledReasonServicemesh}
            supportLevel={featureSupportLevel.getFeatureSupportLevel('SERVICEMESH')}
          />
        }
        helperText={<ServiceMeshHelperText />}
        isDisabled={!!disabledReason || !!disabledReasonServicemesh}
      />
    </FormGroup>
  );
};

export default ServiceMeshCheckbox;
