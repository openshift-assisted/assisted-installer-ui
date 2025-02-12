import React, { useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { useFormikContext } from 'formik';
import {
  ClusterOperatorProps,
  CNV_LINK,
  getFieldId,
  OperatorsValues,
  PopoverIcon,
} from '../../../../common';
import CnvHostRequirements from './CnvHostRequirements';
import {
  getCnvDisabledWithMtvReason,
  getCnvIncompatibleWithLvmReason,
} from '../../featureSupportLevels/featureStateUtils';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/assisted-installer-service';

const CNV_FIELD_NAME = 'useContainerNativeVirtualization';

type CnvLabelProps = {
  clusterId: string;
  disabledReason?: string;
  isVersionEqualsOrMajorThan4_15: boolean;
  supportLevel?: SupportLevel;
};

const CnvLabel = ({
  clusterId,
  disabledReason,
  isVersionEqualsOrMajorThan4_15,
  supportLevel,
}: CnvLabelProps) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install OpenShift Virtualization </span>
      </Tooltip>
      <PopoverIcon
        component={'a'}
        headerContent="Additional requirements"
        bodyContent={
          <CnvHostRequirements
            clusterId={clusterId}
            isVersionEqualsOrMajorThan4_15={isVersionEqualsOrMajorThan4_15}
          />
        }
      />
      <NewFeatureSupportLevelBadge featureId="CNV" supportLevel={supportLevel} />
    </>
  );
};

const CnvHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Run virtual machines alongside containers on one platform.{' '}
        <a href={CNV_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const CnvCheckbox = ({
  clusterId,
  isVersionEqualsOrMajorThan4_15,
  disabledReason,
}: {
  clusterId: ClusterOperatorProps['clusterId'];
  isVersionEqualsOrMajorThan4_15: boolean;
  disabledReason?: string;
}) => {
  const fieldId = getFieldId(CNV_FIELD_NAME, 'input');

  const featureSupportLevel = useNewFeatureSupportLevel();
  const { values } = useFormikContext<OperatorsValues>();
  const [disabledReasonCnv, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    let reason = featureSupportLevel.getFeatureDisabledReason('CNV');
    if (!reason) {
      const lvmSupport = featureSupportLevel.getFeatureSupportLevel('LVM');
      reason = getCnvIncompatibleWithLvmReason(values, lvmSupport);
    }
    if (!reason) {
      reason = getCnvDisabledWithMtvReason(values);
    }
    setDisabledReason(reason);
  }, [values, featureSupportLevel]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={CNV_FIELD_NAME}
        label={
          <CnvLabel
            clusterId={clusterId}
            disabledReason={disabledReason ? disabledReason : disabledReasonCnv}
            isVersionEqualsOrMajorThan4_15={isVersionEqualsOrMajorThan4_15}
            supportLevel={featureSupportLevel.getFeatureSupportLevel('CNV')}
          />
        }
        helperText={<CnvHelperText />}
        isDisabled={!!disabledReason || !!disabledReasonCnv}
      />
    </FormGroup>
  );
};

export default CnvCheckbox;
