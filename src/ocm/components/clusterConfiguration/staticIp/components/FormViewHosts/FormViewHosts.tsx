/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { StaticIpForm } from '../StaticIpForm';
import { StaticIpFormProps, StaticIpViewProps } from '../propTypes';

import { FormViewHostsValues, StaticProtocolType } from '../../data/dataTypes';
import { FormViewHostsFields } from './FormViewHostsFields';
import { getFormViewHostsValidationSchema } from './formViewHostsValidationSchema';
import { formViewHostsToInfraEnvField } from '../../data/formDataToInfraEnvField';
import { getEmptyFormViewHostsValues } from '../../data/emptyData';
import { getFormViewHostsValues, getFormViewNetworkWideValues } from '../../data/fromInfraEnv';
import { useErrorHandler } from '../../../../../../common/errorHandling/ErrorHandlerContext';
import { ErrorState, InfraEnv } from '../../../../../../common';

export const FormViewHosts: React.FC<StaticIpViewProps> = ({ infraEnv, ...props }) => {
  const { handleError } = useErrorHandler();
  const [protocolType, setProtocolType] = React.useState<StaticProtocolType>();
  const [formProps, setFormProps] = React.useState<StaticIpFormProps<FormViewHostsValues>>();
  const [errorMsg, setErrorMsg] = React.useState<string>();
  React.useEffect(() => {
    let networkWideValues;
    try {
      networkWideValues = getFormViewNetworkWideValues(infraEnv);
      setProtocolType(networkWideValues.protocolType);
    } catch (err) {
      const msg = `Failed to get static ip network wide configurations from infra env ${infraEnv.id}`;
      setErrorMsg(msg);
      handleError({
        error: err,
        message: msg,
        showAlert: false,
      });
    }
    if (networkWideValues) {
      setFormProps({
        infraEnv,
        validationSchema: getFormViewHostsValidationSchema(networkWideValues),
        getInitialValues: (infraEnv: InfraEnv) => {
          return getFormViewHostsValues(infraEnv);
        },
        getUpdateParams: (currentInfraEnv: InfraEnv, values: FormViewHostsValues) =>
          formViewHostsToInfraEnvField(currentInfraEnv, values.hosts),
        getEmptyValues: () => getEmptyFormViewHostsValues(),
        ...props,
      });
    }
  }, []);
  if (errorMsg) {
    return <ErrorState title="Parsing error" content={errorMsg} />;
  }
  if (!formProps || !protocolType) {
    return null;
  }
  return (
    <StaticIpForm<FormViewHostsValues> {...formProps}>
      <FormViewHostsFields protocolType={protocolType} />
    </StaticIpForm>
  );
};
