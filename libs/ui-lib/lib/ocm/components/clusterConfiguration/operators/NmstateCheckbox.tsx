import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon, ClusterOperatorProps, getNmstateLink } from '../../../../common';
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

const NmstateHelperText = ({ openshiftVersion }: { openshiftVersion?: string }) => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Provides users with functionality to configure various network interface types, DNS, and
        routing on cluster nodes.{' '}
        <a href={getNmstateLink(openshiftVersion)} target="_blank" rel="noopener noreferrer">
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
  openshiftVersion,
}: {
  clusterId: ClusterOperatorProps['clusterId'];
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
  openshiftVersion?: string;
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
        helperText={<NmstateHelperText openshiftVersion={openshiftVersion || '4.17'} />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default NmstateCheckbox;
