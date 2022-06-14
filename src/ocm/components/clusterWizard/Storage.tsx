import React from 'react';
import { StorageStep } from '../clusterConfiguration/StorageStep';
import { Formik, FormikConfig, FormikProps } from 'formik';
import {
  Cluster,
  getFormikErrorFields,
  FormikAutoSave,
  ClusterWizardStep,
  useAlerts,
  getHostDiscoveryInitialValues,
  getStorageInitialValues,
} from '../../../common';
import { StorageValues } from '../../../common/types/clusters';
import ClusterWizardContext from './ClusterWizardContext';
import ClusterWizardFooter from './ClusterWizardFooter';
import { useClusterWizardContext } from './ClusterWizardContext';
import ClusterWizardNavigation from './ClusterWizardNavigation';

const Storage: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  //const dispatch = useDispatch();
  const clusterWizardContext = useClusterWizardContext();
  const { clearAlerts } = useAlerts();
  const initialValues = React.useMemo(
    () => getStorageInitialValues(cluster),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // just once, Formik does not reinitialize
  );

  const handleSubmit: FormikConfig<StorageValues>['onSubmit'] = async () => {
    clearAlerts();
  };

  return (
    <Formik onSubmit={handleSubmit} initialValues={initialValues}>
      {({ isSubmitting, errors, touched }: FormikProps<StorageValues>) => {
        const errorFields = getFormikErrorFields(errors, touched);

        const footer = (
          <ClusterWizardFooter
            cluster={cluster}
            errorFields={errorFields}
            isSubmitting={isSubmitting}
            //isNextDisabled={dirty || !canNextHostDiscovery({ cluster })}
            onNext={() => clusterWizardContext.moveNext()}
            onBack={() => clusterWizardContext.moveBack()}
          />
        );

        return (
          <ClusterWizardStep
            navigation={<ClusterWizardNavigation cluster={cluster} />}
            footer={footer}
          >
            <StorageStep cluster={cluster} />
            <FormikAutoSave />
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

export default Storage;
