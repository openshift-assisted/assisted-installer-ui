import React, { useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, KMM_LINK } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

const KMM_FIELD_NAME = 'useKmm';

const KmmLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Kernel Module Management </span>
      </Tooltip>
      <NewFeatureSupportLevelBadge featureId="KMM" supportLevel={supportLevel} />
    </>
  );
};

const KmmHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Management of kernel modules.{' '}
        <a href={KMM_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const KmmCheckbox = ({ disabledReason }: { disabledReason?: string }) => {
  const fieldId = getFieldId(KMM_FIELD_NAME, 'input');
  const featureSupportLevel = useNewFeatureSupportLevel();
  const [disabledReasonKmm, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    const reason = featureSupportLevel.getFeatureDisabledReason('KMM');
    setDisabledReason(reason);
  }, [featureSupportLevel]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={KMM_FIELD_NAME}
        label={
          <KmmLabel
            disabledReason={disabledReason ? disabledReason : disabledReasonKmm}
            supportLevel={featureSupportLevel.getFeatureSupportLevel('KMM')}
          />
        }
        helperText={<KmmHelperText />}
        isDisabled={!!disabledReason || !!disabledReasonKmm}
      />
    </FormGroup>
  );
};

export default KmmCheckbox;
