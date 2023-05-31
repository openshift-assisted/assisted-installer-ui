import React from 'react';
import { useField, useFormikContext } from 'formik';
import { Grid } from '@patternfly/react-core';
import { CheckboxField, HelperText, PopoverIcon } from '../ui';
import { TrustedCertificateFieldsType } from '../../types';
import { useTranslation } from '../../hooks/use-translation-wrapper';

import { InfraEnv } from '../../api';
import CertificatesUploadField from '../ui/formik/CertificatesUploadField';
import './CertificateFields.css';
const FIELD_NAME = 'trustBundle';

export const CertificateFieldsHelperText = ({ fieldId = FIELD_NAME }) => {
  const { t } = useTranslation();
  return (
    <HelperText fieldId={fieldId}>
      {t('ai:Paste in 1 or more PEM formatted certificates that you want the cluster to trust.')}
    </HelperText>
  );
};
export const CertificateInputFields = () => {
  const [{ name, value }, , { setValue }] = useField<InfraEnv['additionalTrustBundle']>(FIELD_NAME);

  const { t } = useTranslation();

  return (
    <Grid hasGutter>
      <CertificatesUploadField
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
        idPostfix="certificates"
        onBlur={() => value && setValue(value)}
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
        className="ai-certificate-fields"
      />
    </>
  );
};

export default CertificateFields;
