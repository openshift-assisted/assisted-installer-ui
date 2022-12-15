import * as React from 'react';
import { Formik } from 'formik';
import noop from 'lodash/noop';
import * as Yup from 'yup';
import NetworkForm from './NetworkForm';
import { TFunction } from 'i18next';
import { NetworkStepProps, NetworkFormValues } from './types';
import {
  day2ApiVipValidationSchema,
  httpProxyValidationSchema,
  ipBlockValidationSchema,
  noProxyValidationSchema,
  sshPublicKeyValidationSchema,
} from '../../../../../common';
import { getAgentsForSelection } from '../../../helpers';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';

const getValidationSchema = (t: TFunction) =>
  Yup.lazy<NetworkFormValues>((values) =>
    Yup.object<NetworkFormValues>().shape({
      machineCIDR: Yup.string().required(t('ai:Required field')),
      sshPublicKey: sshPublicKeyValidationSchema.required(t('ai:Required field')),
      serviceCIDR: values.isAdvanced ? ipBlockValidationSchema(values.podCIDR) : Yup.string(),
      podCIDR: values.isAdvanced ? ipBlockValidationSchema(values.serviceCIDR) : Yup.string(),
      httpProxy: httpProxyValidationSchema(values, 'httpsProxy'),
      httpsProxy: httpProxyValidationSchema(values, 'httpProxy'), // share the schema, httpS is currently not supported
      noProxy: noProxyValidationSchema,
      nodePortAddress:
        values.apiPublishingStrategy === 'NodePort'
          ? day2ApiVipValidationSchema.required(t('ai:Required field'))
          : Yup.string(),
    }),
  );

const NetworkStep: React.FC<NetworkStepProps> = ({
  agents,
  formRef,
  onValuesChanged,
  initialValues,
}) => {
  const { t } = useTranslation();

  const availableAgents = getAgentsForSelection(agents).filter(
    (a) => !a.spec.clusterDeploymentName,
  );

  return (
    <Formik<NetworkFormValues>
      initialValues={initialValues}
      validationSchema={getValidationSchema(t)}
      innerRef={formRef}
      onSubmit={noop}
    >
      <NetworkForm agents={availableAgents} onValuesChanged={onValuesChanged} />
    </Formik>
  );
};

export default NetworkStep;
