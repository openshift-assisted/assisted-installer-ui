import React from 'react';
import { StorageStep } from './StorageStep';
import { Formik, FormikConfig, FormikProps } from 'formik';
import {
  Cluster,
  getFormikErrorFields,
  FormikAutoSave,
  ClusterWizardStep,
  useAlerts,
  getHostDiscoveryInitialValues,
} from '../../../common';
import { StorageValues } from '../../../common/types/clusters';
import ClusterWizardContext from '../clusterWizard/ClusterWizardContext';
import ClusterWizardFooter from '../clusterWizard/ClusterWizardFooter';

import ClusterWizardNavigation from '../clusterWizard/ClusterWizardNavigation';

const Storage: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  //const dispatch = useDispatch();
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const { clearAlerts } = useAlerts();
  const initialValues = React.useMemo(
    () => getHostDiscoveryInitialValues(cluster),
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
            onNext={() => setCurrentStepId('networking')}
            onBack={() => setCurrentStepId('host-discovery')}
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
