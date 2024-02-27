import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { getFieldId, PopoverIcon, MCE_LINK } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import { useSelector } from 'react-redux';
import { selectIsCurrentClusterSNO } from '../../../store/slices/current-cluster/selectors';
import { getOdfLvmsText } from './utils';

const MCE_FIELD_NAME = 'useMultiClusterEngine';

const MceLabel = ({
  disabledReason,
  isVersionEqualsOrMajorThan4_15,
  isSNO,
}: {
  disabledReason?: string;
  isVersionEqualsOrMajorThan4_15: boolean;
  isSNO: boolean;
}) => {
  const odfLvmsText = getOdfLvmsText(isSNO, isVersionEqualsOrMajorThan4_15);
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install multicluster engine </span>
      </Tooltip>
      <PopoverIcon
        id={MCE_FIELD_NAME}
        component={'a'}
        headerContent="Additional requirements"
        bodyContent={<>{odfLvmsText}</>}
      />
    </>
  );
};

const MceHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Create, import, and manage multiple clusters from this cluster.{' '}
        <a href={MCE_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const MceCheckbox = ({
  isVersionEqualsOrMajorThan4_15,
}: {
  isVersionEqualsOrMajorThan4_15: boolean;
}) => {
  const isSNO = useSelector(selectIsCurrentClusterSNO);
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
            isSNO={isSNO}
          />
        }
        isDisabled={!!disabledReason}
        helperText={<MceHelperText />}
      />
    </FormGroup>
  );
};

export default MceCheckbox;
