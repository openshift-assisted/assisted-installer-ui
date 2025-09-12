import React from 'react';
import { Formik, FormikProps, useFormikContext } from 'formik';
import { Stack } from '@patternfly/react-core';
import noop from 'lodash-es/noop.js';
import { ClusterDetailsValues, getRichTextValidation } from '../../../../common';
import { ClusterImageSetK8sResource } from '../../../types/k8s/cluster-image-set';
import { useDetailsFormik } from './ClusterDeploymentDetailsStep';
import { ClusterDetailsFormFieldsProps } from './ClusterDetailsFormFields';
import { OsImage } from '../../../types';
import { getOCPVersions } from '../../helpers';
import { ClusterDeploymentDetailsForm } from './ClusterDeploymentDetailsForm';

type DetailsFormBodyProps = {
  clusterImages: ClusterImageSetK8sResource[];
  onValuesChanged: (values: ClusterDetailsValues, initRender: boolean) => void;
  extensionAfter: ClusterDetailsFormFieldsProps['extensionAfter'];
  osImages?: OsImage[];
  isNutanix?: boolean;
};

const DetailsFormBody: React.FC<DetailsFormBodyProps> = ({
  onValuesChanged,
  clusterImages,
  extensionAfter,
  isNutanix,
  osImages,
}) => {
  const { values } = useFormikContext<ClusterDetailsValues>();
  const initRenderRef = React.useRef(true);
  React.useEffect(() => onValuesChanged(values, initRenderRef.current), [onValuesChanged, values]);
  React.useEffect(() => {
    initRenderRef.current = false;
  }, []);

  return (
    <Stack hasGutter>
      <ClusterDeploymentDetailsForm
        clusterImages={clusterImages}
        extensionAfter={extensionAfter}
        isNutanix={isNutanix}
        osImages={osImages}
      />
    </Stack>
  );
};

type ACMClusterDeploymentDetailsStepProps = DetailsFormBodyProps & {
  usedClusterNames: string[];
  formRef: React.Ref<FormikProps<ClusterDetailsValues>>;
};

export const ACMClusterDeploymentDetailsStep: React.FC<ACMClusterDeploymentDetailsStepProps> = ({
  clusterImages,
  formRef,
  usedClusterNames,
  osImages,
  isNutanix,
  ...rest
}) => {
  const ocpVersions = getOCPVersions(clusterImages, !!isNutanix, osImages);

  const [initialValues, validationSchema] = useDetailsFormik({
    ocpVersions,
    usedClusterNames,
  });

  return (
    <Formik
      initialValues={initialValues}
      validate={getRichTextValidation(validationSchema)}
      innerRef={formRef}
      onSubmit={noop}
    >
      <DetailsFormBody
        clusterImages={clusterImages}
        osImages={osImages}
        isNutanix={isNutanix}
        {...rest}
      />
    </Formik>
  );
};
