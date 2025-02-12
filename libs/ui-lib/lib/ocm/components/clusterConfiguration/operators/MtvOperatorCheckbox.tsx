import React, { useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import {
  getFieldId,
  PopoverIcon,
  MTV_LINK,
  OperatorsValues,
  ClusterOperatorProps,
} from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import { useFormikContext } from 'formik';
import MtvRequirements from './MtvRequirements';

const Mtv_FIELD_NAME = 'useMigrationToolkitforVirtualization';

const MtvLabel = ({
  disabledReason,
  clusterId,
}: {
  disabledReason?: string;
  clusterId: string;
}) => (
  <>
    <Tooltip hidden={!disabledReason} content={disabledReason}>
      <span>Install Migration Toolkit for Virtualization </span>
    </Tooltip>
    <PopoverIcon
      component={'a'}
      headerContent="Additional requirements"
      bodyContent={<MtvRequirements clusterId={clusterId} />}
    />
  </>
);

const MtvHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        The Migration Toolkit for Virtualization (MTV) enables you to migrate virtual machines from
        VMware vSphere, Red Hat Virtualization, or OpenStack to OpenShift Virtualization running on
        Red Hat OpenShift.{' '}
        <a href={MTV_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const MtvCheckbox = ({
  clusterId,
  disabledReason,
}: {
  clusterId: ClusterOperatorProps['clusterId'];
  disabledReason?: string;
}) => {
  // eslint-disable-next-line no-console
  console.log(disabledReason);
  const featureSupportLevelContext = useNewFeatureSupportLevel();
  const { values, setFieldValue } = useFormikContext<OperatorsValues>();
  const fieldId = getFieldId(Mtv_FIELD_NAME, 'input');
  const [disabledReasonMtv, setDisabledReason] = useState<string | undefined>('');

  const selectCNVOperator = (checked: boolean) => {
    setFieldValue('useContainerNativeVirtualization', checked);
  };

  React.useEffect(() => {
    const disabledReason = featureSupportLevelContext.getFeatureDisabledReason('MTV');
    if (disabledReason !== undefined) setDisabledReason(disabledReason);
  }, [values, featureSupportLevelContext]);

  React.useEffect(() => {
    setDisabledReason(disabledReason);
  }, [disabledReason]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={Mtv_FIELD_NAME}
        label={<MtvLabel disabledReason={disabledReasonMtv} clusterId={clusterId} />}
        isDisabled={!!disabledReasonMtv}
        helperText={<MtvHelperText />}
        onChange={selectCNVOperator}
      />
    </FormGroup>
  );
};

export default MtvCheckbox;
