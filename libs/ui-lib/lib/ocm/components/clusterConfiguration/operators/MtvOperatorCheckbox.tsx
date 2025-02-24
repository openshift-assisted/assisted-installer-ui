import React from 'react';
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
import { useFormikContext } from 'formik';
import MtvRequirements from './MtvRequirements';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';

const Mtv_FIELD_NAME = 'useMigrationToolkitforVirtualization';

const MtvLabel = ({
  disabledReason,
  clusterId,
  supportLevel,
}: {
  disabledReason?: string;
  clusterId: string;
  supportLevel?: SupportLevel;
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
    <NewFeatureSupportLevelBadge featureId="MTV" supportLevel={supportLevel} />
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
  supportLevel,
}: {
  clusterId: ClusterOperatorProps['clusterId'];
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const { setFieldValue } = useFormikContext<OperatorsValues>();
  const fieldId = getFieldId(Mtv_FIELD_NAME, 'input');

  const selectCNVOperator = (checked: boolean) => {
    setFieldValue('useContainerNativeVirtualization', checked);
  };

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={Mtv_FIELD_NAME}
        label={
          <MtvLabel
            disabledReason={disabledReason}
            clusterId={clusterId}
            supportLevel={supportLevel}
          />
        }
        isDisabled={!!disabledReason}
        helperText={<MtvHelperText />}
        onChange={selectCNVOperator}
      />
    </FormGroup>
  );
};

export default MtvCheckbox;
