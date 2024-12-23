import { Formik, FormikProps, useFormikContext } from 'formik';
import noop from 'lodash-es/noop.js';
import * as React from 'react';
import { Ref } from 'react';
import { ClusterDetailsValues, getRichTextValidation } from '../../../common';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';
import ClusterDeploymentDetailsForm from './ClusterDeploymentDetailsForm';
import { useDetailsFormik } from './ClusterDeploymentDetailsStep';
import { ClusterDetailsFormFieldsProps } from './ClusterDetailsFormFields';
import { OsImage } from '../../types';
import { getOCPVersions } from '../helpers';

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
    <ClusterDeploymentDetailsForm
      clusterImages={clusterImages}
      extensionAfter={extensionAfter}
      isNutanix={isNutanix}
      osImages={osImages}
    />
  );
};

type ACMClusterDeploymentDetailsStepProps = DetailsFormBodyProps & {
  usedClusterNames: string[];
  formRef: Ref<FormikProps<ClusterDetailsValues>>;
};

const ACMClusterDeploymentDetailsStep: React.FC<ACMClusterDeploymentDetailsStepProps> = ({
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

export default ACMClusterDeploymentDetailsStep;
