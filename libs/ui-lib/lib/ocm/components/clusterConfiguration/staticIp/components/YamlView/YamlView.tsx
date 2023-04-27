import React from 'react';
import { StaticIpForm } from '../StaticIpForm';
import { StaticIpFormProps, StaticIpViewProps } from '../propTypes';
import { yamlViewValidationSchema } from './yamlViewValidationSchema';
import { YamlViewValues } from '../../data/dataTypes';
import { YamlViewFields } from './YamlViewFields';
import { getEmptyYamlValues } from '../../data/emptyData';
import { InfraEnv } from '../../../../../../common';
import { getYamlViewValues } from '../../data/fromInfraEnv';

export const YamlView: React.FC<StaticIpViewProps> = ({ ...props }) => {
  const formProps: StaticIpFormProps<YamlViewValues> = {
    ...props,
    validationSchema: yamlViewValidationSchema,
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
