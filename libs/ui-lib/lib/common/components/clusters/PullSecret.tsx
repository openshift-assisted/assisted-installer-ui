import React from 'react';
import { Alert, AlertVariant, Checkbox } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { ClusterCreateParams } from '@openshift-assisted/types/assisted-installer-service';
import { PullSecretField, PullSecretInfo } from '../ui';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export type PullSecretProps = {
  defaultPullSecret?: string;
  isOcm?: boolean;
  isPullSecretSet?: boolean;
  isSingleClusterFeatureEnabled?: boolean;
};

const PullSecret: React.FC<PullSecretProps> = ({
  defaultPullSecret,
  isOcm = false,
  isPullSecretSet = false,
  isSingleClusterFeatureEnabled = false,
}) => {
  // Fetched pull secret will never change - see LoadingState in NewCluster
  const [isExpanded, setExpanded] = React.useState(!defaultPullSecret);
  const { setFieldValue } = useFormikContext<ClusterCreateParams>();
  const { t } = useTranslation();
  const onCheckboxChange = () => {
    if (isExpanded) {
      // about to collapse, reset to original value
      setFieldValue('pullSecret', defaultPullSecret);
    }
    setExpanded(!isExpanded);
  };

  if (!(isOcm || isSingleClusterFeatureEnabled)) {
    return <PullSecretField isOcm={isOcm} />;
  }

  return (
    <>
      {isPullSecretSet && (
        <Alert variant={AlertVariant.success} isInline title={t('ai:Pull secret configured')}>
          {t('ai:A pull secret has already been set for this cluster. You can edit it below.')}
        </Alert>
      )}
      <Checkbox
        id="checkbox-pull-secret"
        className="pf-v6-u-display-inline-flex"
        aria-label={t('ai:edit pull secret')}
        isChecked={isExpanded}
        onChange={onCheckboxChange}
        label={
          <>
            {t('ai:Edit pull secret')} <PullSecretInfo isOcm={isOcm} />
          </>
        }
      />
      {isExpanded && <PullSecretField isOcm={isOcm} />}
    </>
  );
};

export default PullSecret;
