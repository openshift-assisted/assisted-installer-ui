import { FormikProps } from 'formik';
import { ObjectSchema } from 'yup';
import { OpenshiftVersionOptionType } from '../../../../../common';
import { ClusterImageSetK8sResource, ConfigMapK8sResource } from '../../../../types';

export type DetailsFormValues = {
  name: string;
  openshiftVersion: string;
  pullSecret: string;
  baseDnsDomain: string;
};

type UseDetailsFormikArgs = {
  usedClusterNames: string[];
  ocpVersions: OpenshiftVersionOptionType[];
  initPullSecret?: string;
  initBaseDomain?: string;
};

export type UseDetailsFormik = (
  args: UseDetailsFormikArgs,
) => [DetailsFormValues, ObjectSchema<Omit<DetailsFormValues, 'openshiftVersion'>>];

export type DetailsStepProps = {
  usedClusterNames: string[];
  clusterImages: ClusterImageSetK8sResource[];
  onValuesChanged: (values: DetailsFormValues, initRender: boolean) => void;
  pullSecret?: string;
  extensionAfter: { [key: string]: React.ReactElement };
  formRef: React.Ref<FormikProps<DetailsFormValues>>;
  initPullSecret?: string;
  initBaseDomain?: string;
  supportedVersionsCM?: ConfigMapK8sResource;
};

export type DetailsFormProps = Pick<DetailsStepProps, 'onValuesChanged' | 'extensionAfter'> & {
  ocpVersions: OpenshiftVersionOptionType[];
};
