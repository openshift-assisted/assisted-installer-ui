import { Formik } from 'formik';
import noop from 'lodash-es/noop.js';
import * as React from 'react';
import * as Yup from 'yup';
import {
  dnsNameValidationSchema,
  ErrorState,
  getDefaultOpenShiftVersion,
  LoadingState,
  nameValidationSchema,
  pullSecretValidationSchema,
} from '../../../../../common';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';
import { useSupportedOCPVersions } from '../../hooks/useSupportedOCPVersions';
import DetailsForm from './DetailsForm';
import { DetailsStepProps, UseDetailsFormik } from './types';
import { useStorageClasses } from '../../../../hooks';

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
      storageClass: '',
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
  const { t } = useTranslation();
  const ocpVersions = useSupportedOCPVersions(clusterImages, t, supportedVersionsCM);
  const allVersions = useSupportedOCPVersions(clusterImages, t, supportedVersionsCM, true);
  const [storageClasses, isLoaded, error] = useStorageClasses({ isList: true });

  const [initialValues, validationSchema] = useDetailsFormik({
    ocpVersions,
    usedClusterNames,
    initPullSecret,
    initBaseDomain,
  });

  if (!isLoaded) {
    return <LoadingState />;
  } else if (error) {
    return <ErrorState />;
  }

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
        storageClasses={storageClasses}
      />
    </Formik>
  );
};

export default DetailsStep;
