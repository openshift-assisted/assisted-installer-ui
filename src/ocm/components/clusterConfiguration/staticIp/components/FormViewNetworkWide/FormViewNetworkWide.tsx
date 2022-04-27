import React from 'react';
import { StaticIpForm } from '../StaticIpForm';
import { StaticIpFormProps, StaticIpViewProps } from '../propTypes';
import { FormViewHost, FormViewNetworkWideValues } from '../../data/dataTypes';
import { networkWideValidationSchema } from './formViewNetworkWideValidationSchema';
import { networkWideToInfraEnvField } from '../../data/formDataToInfraEnvField';
import { FormViewNetworkWideFields } from './FormViewNetworkWideFields';
import { getFormData, getFormViewNetworkWideValues } from '../../data/fromInfraEnv';
import { getEmptyNetworkWideConfigurations } from '../../data/emptyData';
import { useErrorHandler } from '../../../../../../common/errorHandling/ErrorHandlerContext';
import { ErrorState, InfraEnv } from '../../../../../../common';

export const FormViewNetworkWide: React.FC<StaticIpViewProps> = ({ infraEnv, ...props }) => {
  const { handleError } = useErrorHandler();
  const [hosts, setHosts] = React.useState<FormViewHost[] | undefined>();
  const [errorMsg, setErrorMsg] = React.useState<string>();
  React.useEffect(() => {
    try {
      setHosts(getFormData(infraEnv).hosts);
    } catch (err) {
      const msg = `Failed to get static ip form view hosts from infra env ${infraEnv.id}`;
      setErrorMsg(msg);
      handleError({
        error: err,
        message: msg,
        showAlert: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formProps: StaticIpFormProps<FormViewNetworkWideValues> | null = React.useMemo(() => {
    if (!hosts) {
      return null;
    }
    return {
      infraEnv,
      ...props,
      validationSchema: networkWideValidationSchema,
      getInitialValues: (infraEnv: InfraEnv) => {
        return getFormViewNetworkWideValues(infraEnv);
      },
      getUpdateParams: (currentInfraEnv: InfraEnv, values: FormViewNetworkWideValues) =>
        networkWideToInfraEnvField(currentInfraEnv, values),
      getEmptyValues: () => getEmptyNetworkWideConfigurations(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hosts]);
  if (errorMsg) {
    return <ErrorState title="Parsing error" content={errorMsg} />;
  }
  if (!formProps || !hosts) {
    return null;
  }
  return (
    <StaticIpForm<FormViewNetworkWideValues> {...formProps}>
      <FormViewNetworkWideFields hosts={hosts} />
    </StaticIpForm>
  );
};
