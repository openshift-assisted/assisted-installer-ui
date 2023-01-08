import React from 'react';
import { Alert, AlertVariant, Text, TextContent } from '@patternfly/react-core';
import { MonitoredOperatorsList, operatorLabels, OperatorName } from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

interface FailedOperatorsWarningProps {
  failedOperators: MonitoredOperatorsList;
}

const FailedOperatorsWarning = ({ failedOperators }: FailedOperatorsWarningProps) => {
  const { t } = useTranslation();
  const operatorText =
    failedOperators.length === 1
      ? `${operatorLabels(t)[(failedOperators[0].name as OperatorName) || '']} operator`
      : `${failedOperators.length} operators`;

  return (
    <Alert variant={AlertVariant.warning} title="Some operators failed to install" isInline>
      <TextContent>
        <Text>
          {`${operatorText} failed to install. Due to this, the cluster will be degraded, but you can try
          to install the operator from the Operator Hub.`}
          <br />
          Please check the installation logs for more information.
        </Text>
      </TextContent>
    </Alert>
  );
};

export default FailedOperatorsWarning;
