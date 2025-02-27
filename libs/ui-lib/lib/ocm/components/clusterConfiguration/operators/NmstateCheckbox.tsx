import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import {
  getFieldId,
  PopoverIcon,
  ClusterOperatorProps,
  NMSTATE_OPERATOR_LINK,
} from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import NmstateRequirements from './NmstateRequirements';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

const NMSTATE_FIELD_NAME = 'useNmstate';

const NmstateLabel = ({
  disabledReason,
  clusterId,
  supportLevel,
}: {
  disabledReason?: string;
  clusterId: ClusterOperatorProps['clusterId'];
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install NMState </span>
      </Tooltip>
      <PopoverIcon
        id={NMSTATE_FIELD_NAME}
        component={'a'}
        headerContent="Additional requirements"
        bodyContent={<NmstateRequirements clusterId={clusterId} />}
      />
      <NewFeatureSupportLevelBadge featureId="NMSTATE" supportLevel={supportLevel} />
    </>
  );
};

const NmstateHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Provides users with functionality to configure various network interface types, DNS, and
        routing on cluster nodes.{' '}
        <a href={NMSTATE_OPERATOR_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const NmstateCheckbox = ({
  clusterId,
  disabledReason,
  supportLevel,
}: {
  clusterId: ClusterOperatorProps['clusterId'];
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const fieldId = getFieldId(NMSTATE_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={NMSTATE_FIELD_NAME}
        label={
          <NmstateLabel
            clusterId={clusterId}
            disabledReason={disabledReason}
            supportLevel={supportLevel}
          />
        }
        helperText={<NmstateHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default NmstateCheckbox;
