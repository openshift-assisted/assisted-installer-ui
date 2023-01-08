import React from 'react';
import { useField, useFormikContext } from 'formik';
import { Grid } from '@patternfly/react-core';
import { CheckboxField, HelperText, PopoverIcon, UploadField } from '../ui';
import { TrustedCertificateFieldsType } from '../../types';
import { useTranslation } from '../../hooks/use-translation-wrapper';

import { InfraEnv } from '../../api';

const FIELD_NAME = 'trustBundle';

export const CertificateFieldsHelperText = ({ fieldId = FIELD_NAME }) => {
  const { t } = useTranslation();
  return (
    <HelperText fieldId={fieldId}>
      {t(
        'ai:Paste one or more PEM formatted certificates that you want the cluster to trust into this field.',
      )}
    </HelperText>
  );
};

export const CertificateInputFields = () => {
  const [{ name, value }, , { setValue }] =
    useField<InfraEnv['additionalTrustBundle']>('trustBundle');

  const { t } = useTranslation();
  return (
    <Grid hasGutter>
      <UploadField
        label={
          <>
            {t('ai:Additional certificates')}{' '}
            <PopoverIcon
              bodyContent={t(
                'ai:You can upload additional trusted certificates in PEM-encoded X.509 format if the cluster hosts are in a network with a re-encrypting (MITM) proxy or the cluster needs to trust certificates for other purposes (for example, container image registries).',
              )}
            />
          </>
        }
        name={name}
        helperText={<CertificateFieldsHelperText />}
        idPostfix="discovery"
        onBlur={() => value && setValue(value)}
        dropzoneProps={{
          accept: '.pem',
          maxSize: 2048,
          onDropRejected:
            ({ setError }) =>
            () =>
              setError(t('ai:File not supported.')),
        }}
      />
    </Grid>
  );
};

const CertificateFields = () => {
  const { setFieldValue, values, initialValues } = useFormikContext<TrustedCertificateFieldsType>();
  const resetCertificate = (isNewlyChecked: boolean) => {
    if (isNewlyChecked) {
      setFieldValue(FIELD_NAME, initialValues.trustBundle);
    } else {
      setFieldValue(FIELD_NAME, '');
    }
  };
  const { t } = useTranslation();
  return (
    <>
      <CheckboxField
        label={t('ai:Configure cluster-wide trusted certificates')}
        name="enableCertificate"
        helperText={
          <p>
            {t(
              'ai:If the cluster hosts are in a network with a re-encrypting (MITM) proxy or the cluster needs to trust certificates for other purposes (e.g. container image registries).',
            )}
          </p>
        }
        onChange={(value: boolean) => resetCertificate(value)}
        body={values.enableCertificate && <CertificateInputFields />}
      />
    </>
  );
};

export default CertificateFields;
