import React from 'react';
import { StaticIpForm } from '../StaticIpForm';
import { StaticIpFormProps, StaticIpViewProps } from '../propTypes';
import { yamlViewValidationSchema } from './yamlViewValidationSchema';
import { YamlViewValues } from '../../data/dataTypes';
import { YamlViewFields } from './YamlViewFields';
import { getEmptyYamlValues } from '../../data/emptyData';
import { InfraEnv } from '@openshift-assisted/types/assisted-installer-service';
import { getYamlViewValues } from '../../data/fromInfraEnv';
import { useTranslation } from '../../../../../../common';

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
