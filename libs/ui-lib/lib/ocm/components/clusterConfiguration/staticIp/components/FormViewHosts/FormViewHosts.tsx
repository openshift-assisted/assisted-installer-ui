import React from 'react';
import { StaticIpForm } from '../StaticIpForm';
import { StaticIpFormProps, StaticIpViewProps } from '../propTypes';

import { FormViewHostsValues, StaticProtocolType } from '../../data/dataTypes';
import { FormViewHostsFields } from './FormViewHostsFields';
import { getFormViewHostsValidationSchema } from './formViewHostsValidationSchema';
import { formViewHostsToInfraEnvField } from '../../data/formDataToInfraEnvField';
import { getEmptyFormViewHostsValues } from '../../data/emptyData';
import { getFormViewHostsValues, getFormViewNetworkWideValues } from '../../data/fromInfraEnv';
import { InfraEnv } from '../../../../../../common/api';

export const FormViewHosts: React.FC<StaticIpViewProps> = ({ infraEnv, ...props }) => {
  const [protocolType, setProtocolType] = React.useState<StaticProtocolType>();
  const [formProps, setFormProps] = React.useState<StaticIpFormProps<FormViewHostsValues>>();
  React.useEffect(() => {
    const networkWideValues = getFormViewNetworkWideValues(infraEnv);
    setProtocolType(networkWideValues.protocolType);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!formProps || !protocolType) {
    return null;
  }
  return (
    <StaticIpForm<FormViewHostsValues> {...formProps}>
      <FormViewHostsFields protocolType={protocolType} />
    </StaticIpForm>
  );
};
