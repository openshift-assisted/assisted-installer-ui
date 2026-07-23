import React from 'react';
import { InfraEnv } from '@openshift-assisted/types/assisted-installer-service';
import { StaticIpForm } from '../StaticIpForm';
import { useTranslation } from '../../../../../../../common';
import { StaticIpFormProps, StaticIpViewProps } from '../propTypes';
import { getEmptyYamlValues, getYamlViewValues, YamlViewValues } from '../../data';
import { yamlViewValidationSchema } from './yamlViewValidationSchema';
import { YamlViewFields } from './YamlViewFields';

export const YamlView: React.FC<StaticIpViewProps> = ({ ...props }) => {
  const { t } = useTranslation();

  const formProps: StaticIpFormProps<YamlViewValues> = {
    ...props,
    validationSchema: yamlViewValidationSchema(t),
    getInitialValues: (infraEnv: InfraEnv) => {
      return getYamlViewValues(infraEnv);
    },
    getUpdateParams: (currentInfraEnv: InfraEnv, values: YamlViewValues) => values.hosts,
    getEmptyValues: () => getEmptyYamlValues(),
  };

  return (
    <StaticIpForm<YamlViewValues> {...formProps}>
      <YamlViewFields />
    </StaticIpForm>
  );
};
