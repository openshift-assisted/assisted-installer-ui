import React from 'react';
import { InfraEnv } from '@openshift-assisted/types/assisted-installer-service';
import { useTranslation } from '../../../../../../../common';
import {
  getEmptyFormViewHostsValues,
  formViewHostsToInfraEnvField,
  FormViewHostsValues,
  StaticProtocolType,
  getFormViewHostsValues,
  getFormViewNetworkWideValues,
} from '../../data';
import { StaticIpForm } from '../StaticIpForm';
import { StaticIpFormProps, StaticIpViewProps } from '../propTypes';
import { FormViewHostsFields } from './FormViewHostsFields';
import { getFormViewHostsValidationSchema } from './formViewHostsValidationSchema';

export const FormViewHosts: React.FC<StaticIpViewProps> = ({ infraEnv, ...props }) => {
  const { t } = useTranslation();
  const [protocolType, setProtocolType] = React.useState<StaticProtocolType>();
  const [formProps, setFormProps] = React.useState<StaticIpFormProps<FormViewHostsValues>>();
  React.useEffect(() => {
    const networkWideValues = getFormViewNetworkWideValues(infraEnv);
    setProtocolType(networkWideValues.protocolType);

    if (networkWideValues) {
      setFormProps({
        infraEnv,
        validationSchema: getFormViewHostsValidationSchema(networkWideValues, t),
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
