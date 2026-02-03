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
      sshPublicKey: sshPublicKeyValidationSchema(t).required(t('ai:Required field')),
      clusterNetworkCidr: values.isAdvanced
        ? ipBlockValidationSchema(values.serviceNetworkCidr, t)
        : Yup.string(),
      serviceNetworkCidr: values.isAdvanced
        ? ipBlockValidationSchema(values.clusterNetworkCidr, t)
        : Yup.string(),
      clusterNetworkHostPrefix: values.isAdvanced
        ? hostPrefixValidationSchema(values.clusterNetworkCidr, t)
        : Yup.number(),
      httpProxy: httpProxyValidationSchema({ values, pairValueName: 'httpsProxy', t }),
      httpsProxy: httpProxyValidationSchema({ values, pairValueName: 'httpProxy', t }), // share the schema, httpS is currently not supported
      noProxy: noProxyValidationSchema(t),
      nodePortAddress:
        values.apiPublishingStrategy === 'NodePort'
          ? day2ApiVipValidationSchema(t).required(t('ai:Required field'))
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
