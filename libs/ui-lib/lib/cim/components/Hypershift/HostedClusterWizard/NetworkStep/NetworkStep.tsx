import * as React from 'react';
import { Formik } from 'formik';
import noop from 'lodash-es/noop.js';
import * as Yup from 'yup';
import NetworkForm from './NetworkForm';
import { TFunction } from 'i18next';
import { NetworkStepProps, NetworkFormValues } from './types';
import {
  day2ApiVipValidationSchema,
  hostPrefixValidationSchema,
  httpProxyValidationSchema,
  ipBlockValidationSchema,
  noProxyValidationSchema,
  sshPublicKeyValidationSchema,
} from '../../../../../common';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';

const getValidationSchema = (t: TFunction) =>
  Yup.lazy((values: NetworkFormValues) =>
    Yup.object<NetworkFormValues>().shape({
      sshPublicKey: sshPublicKeyValidationSchema.required(t('ai:Required field')),
      clusterNetworkCidr: values.isAdvanced
        ? ipBlockValidationSchema(values.serviceNetworkCidr)
        : Yup.string(),
      serviceNetworkCidr: values.isAdvanced
        ? ipBlockValidationSchema(values.clusterNetworkCidr)
        : Yup.string(),
      clusterNetworkHostPrefix: values.isAdvanced
        ? hostPrefixValidationSchema(values.clusterNetworkCidr)
        : Yup.number(),
      httpProxy: httpProxyValidationSchema({ values, pairValueName: 'httpsProxy' }),
      httpsProxy: httpProxyValidationSchema({ values, pairValueName: 'httpProxy' }), // share the schema, httpS is currently not supported
      noProxy: noProxyValidationSchema,
      nodePortAddress:
        values.apiPublishingStrategy === 'NodePort'
          ? day2ApiVipValidationSchema.required(t('ai:Required field'))
          : Yup.string(),
    }),
  );

const NetworkStep: React.FC<NetworkStepProps> = ({ formRef, onValuesChanged, initialValues }) => {
  const { t } = useTranslation();

  return (
    <Formik<NetworkFormValues>
      initialValues={initialValues}
      validationSchema={getValidationSchema(t)}
      innerRef={formRef}
      onSubmit={noop}
    >
      <NetworkForm onValuesChanged={onValuesChanged} />
    </Formik>
  );
};

export default NetworkStep;
