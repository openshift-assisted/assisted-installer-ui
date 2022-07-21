import { Formik } from 'formik';
import noop from 'lodash/noop';
import * as React from 'react';
import * as Yup from 'yup';
import {
  dnsNameValidationSchema,
  getDefaultOpenShiftVersion,
  nameValidationSchema,
  pullSecretValidationSchema,
} from '../../../../../common';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';
import { getOCPVersions } from '../../../helpers';
import DetailsForm from './DetailsForm';
import { DetailsStepProps, UseDetailsFormik } from './types';

const useDetailsFormik: UseDetailsFormik = ({
  clusterImages,
  usedClusterNames,
  initPullSecret = '',
  initBaseDomain = '',
}) => {
  const { t } = useTranslation();
  const ocpVersions = getOCPVersions(clusterImages);
  const initialValues = React.useMemo(
    () => ({
      name: '',
      openshiftVersion: getDefaultOpenShiftVersion(ocpVersions),
      pullSecret: initPullSecret,
      baseDnsDomain: initBaseDomain,
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const validationSchema = React.useMemo(
    () =>
      Yup.object({
        name: nameValidationSchema(t, usedClusterNames),
        baseDnsDomain: dnsNameValidationSchema.required('Required'),
        pullSecret: pullSecretValidationSchema.required('Required.'),
      }),
    [usedClusterNames],
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
  const [initialValues, validationSchema] = useDetailsFormik({
    clusterImages,
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
        clusterImages={clusterImages}
        extensionAfter={extensionAfter}
        supportedVersionsCM={supportedVersionsCM}
      />
    </Formik>
  );
};

export default DetailsStep;
