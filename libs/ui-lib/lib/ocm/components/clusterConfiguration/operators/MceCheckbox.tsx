import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { getFieldId, PopoverIcon, getMceDocsLink, ClusterOperatorProps } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import MceRequirements from './MceRequirements';

const MCE_FIELD_NAME = 'useMultiClusterEngine';

const MceLabel = ({
  disabledReason,
  isVersionEqualsOrMajorThan4_15,
  clusterId,
}: {
  disabledReason?: string;
  isVersionEqualsOrMajorThan4_15: boolean;
  clusterId: ClusterOperatorProps['clusterId'];
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install multicluster engine </span>
      </Tooltip>
      <PopoverIcon
        id={MCE_FIELD_NAME}
        component={'a'}
        headerContent="Additional requirements"
        bodyContent={
          <MceRequirements
            clusterId={clusterId}
            isVersionEqualsOrMajorThan4_15={isVersionEqualsOrMajorThan4_15}
          />
        }
      />
    </>
  );
};

const MceHelperText = ({ docsVersion }: { docsVersion: string }) => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Create, import, and manage multiple clusters from this cluster.{' '}
        <a href={getMceDocsLink(docsVersion)} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const MceCheckbox = ({
  clusterId,
  isVersionEqualsOrMajorThan4_15,
  openshiftVersion,
}: {
  isVersionEqualsOrMajorThan4_15: boolean;
  openshiftVersion?: string;
  clusterId: ClusterOperatorProps['clusterId'];
}) => {
  const featureSupportLevelContext = useNewFeatureSupportLevel();
  const fieldId = getFieldId(MCE_FIELD_NAME, 'input');
  const disabledReason = featureSupportLevelContext.getFeatureDisabledReason('MCE');
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={MCE_FIELD_NAME}
        label={
          <MceLabel
            disabledReason={disabledReason}
            isVersionEqualsOrMajorThan4_15={isVersionEqualsOrMajorThan4_15}
            clusterId={clusterId}
          />
        }
        isDisabled={!!disabledReason}
        helperText={<MceHelperText docsVersion={openshiftVersion || ''} />}
      />
    </FormGroup>
  );
};

export default MceCheckbox;
