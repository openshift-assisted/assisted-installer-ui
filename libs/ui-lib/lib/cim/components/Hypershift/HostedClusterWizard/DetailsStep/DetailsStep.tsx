import { Formik } from 'formik';
import noop from 'lodash-es/noop.js';
import * as React from 'react';
import * as Yup from 'yup';
import {
  dnsNameValidationSchema,
  getDefaultOpenShiftVersion,
  nameValidationSchema,
  pullSecretValidationSchema,
} from '../../../../../common';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';
import { useSupportedOCPVersions } from '../../hooks/useSupportedOCPVersions';
import DetailsForm from './DetailsForm';
import { DetailsStepProps, UseDetailsFormik } from './types';

const useDetailsFormik: UseDetailsFormik = ({
  ocpVersions,
  usedClusterNames,
  initPullSecret = '',
  initBaseDomain = '',
}) => {
  const { t } = useTranslation();
  const initialValues = React.useMemo(
    () => ({
      name: '',
      openshiftVersion: getDefaultOpenShiftVersion(ocpVersions),
      pullSecret: initPullSecret,
      baseDnsDomain: initBaseDomain,
      customOpenshiftSelect: null,
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const validationSchema = React.useMemo(
    () =>
      Yup.object({
        name: nameValidationSchema(t, usedClusterNames),
        baseDnsDomain: dnsNameValidationSchema(t).required(t('ai:Required field')),
        pullSecret: pullSecretValidationSchema(t).required(t('ai:Required field')),
      }),
    [usedClusterNames, t],
  );

  return [initialValues, validationSchema];
};

const DetailsStep: React.FC<DetailsStepProps> = ({
  usedClusterNames,
  clusterImages,
  onValuesChanged,
  extensionAfter,
  formRef,
  initBaseDomain,
  initPullSecret,
  supportedVersionsCM,
}) => {
  const ocpVersions = useSupportedOCPVersions(clusterImages, supportedVersionsCM);
  const allVersions = useSupportedOCPVersions(clusterImages, supportedVersionsCM, true);

  const [initialValues, validationSchema] = useDetailsFormik({
    ocpVersions,
    usedClusterNames,
    initPullSecret,
    initBaseDomain,
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      innerRef={formRef}
      onSubmit={noop}
    >
      <DetailsForm
        onValuesChanged={onValuesChanged}
        ocpVersions={ocpVersions}
        allVersions={allVersions}
        extensionAfter={extensionAfter}
      />
    </Formik>
  );
};

export default DetailsStep;
