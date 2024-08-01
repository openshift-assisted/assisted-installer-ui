import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom-v5-compat';
import { Grid, GridItem } from '@patternfly/react-core';
import isUndefined from 'lodash-es/isUndefined.js';
import { Formik, FormikHelpers } from 'formik';
import {
  ClusterWizardStep,
  ClusterWizardStepHeader,
  getClusterDetailsValidationSchema,
  getRichTextValidation,
  CpuArchitecture,
  useAlerts,
} from '../../../common';
import { canNextClusterDetails } from './wizardTransition';
import { OpenshiftVersionOptionType, getFormikErrorFields } from '../../../common';
import ClusterWizardFooter from './ClusterWizardFooter';
import { isInOcm } from '../../../common/api';
import {
  ClusterDetailsService,
  ClusterDetailsUpdateParams,
  OcmClusterDetailsValues,
} from '../../services';
import { OcmClusterDetailsFormFields } from '../clusterConfiguration/OcmClusterDetailsFormFields';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { selectCurrentClusterPermissionsState } from '../../store/slices/current-cluster/selectors';
import { useClusterWizardContext } from './ClusterWizardContext';
import { useNewFeatureSupportLevel } from '../../../common/components/newFeatureSupportLevels';
import {
  Cluster,
  ClusterCreateParams,
  InfraEnv,
  ManagedDomain,
} from '@openshift-assisted/types/assisted-installer-service';

type ClusterDetailsFormProps = {
  cluster?: Cluster;
  infraEnv?: InfraEnv;
  pullSecret: string;
  managedDomains: ManagedDomain[];
  ocpVersions: OpenshiftVersionOptionType[];
  usedClusterNames: string[];
  navigation: React.ReactNode;
  moveNext: () => void;
  handleClusterCreate: (params: ClusterCreateParams, addCustomManifests: boolean) => Promise<void>;
  handleClusterUpdate: (
    clusterId: Cluster['id'],
    params: ClusterDetailsUpdateParams,
    addCustomManifests: boolean,
  ) => Promise<void>;
};

const ClusterDetailsForm = (props: ClusterDetailsFormProps) => {
  const {
    cluster,
    infraEnv,
    pullSecret,
    managedDomains,
    ocpVersions,
    usedClusterNames = [],
    moveNext,
    handleClusterUpdate,
    handleClusterCreate,
    navigation,
  } = props;

  const clusterWizardContext = useClusterWizardContext();
  const { search } = useLocation();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const featureSupportLevels = useNewFeatureSupportLevel();
  const { clearAlerts } = useAlerts();

  const handleSubmit = React.useCallback(
    async (values: OcmClusterDetailsValues) => {
      if (cluster) {
        let resetPlatform = values.platform;
        const clusterPlatform = cluster.platform?.type;
        if (
          values.platform === 'none' &&
          clusterPlatform !== 'none' &&
          clusterPlatform !== 'baremetal'
        ) {
          resetPlatform = 'baremetal';
        }
        const params = ClusterDetailsService.getClusterUpdateParams(values, resetPlatform);
        await handleClusterUpdate(cluster.id, params, values.addCustomManifest);
      } else {
        const params = ClusterDetailsService.getClusterCreateParams(values);
        await handleClusterCreate(params, values.addCustomManifest);
      }
    },
    [cluster, handleClusterCreate, handleClusterUpdate],
  );

  const handleOnNext = React.useCallback(
    (
      dirty: boolean,
      submitForm: FormikHelpers<unknown>['submitForm'],
      cluster?: Cluster,
    ): (() => void) => {
      if (isViewerMode || (!dirty && !isUndefined(cluster) && canNextClusterDetails({ cluster }))) {
        clearAlerts();
        return moveNext;
      }

      return () => {
        void submitForm();
      };
    },
    [isViewerMode, moveNext, clearAlerts],
  );

  const initialValues = React.useMemo(
    () =>
      ClusterDetailsService.getClusterDetailsInitialValues({
        infraEnv,
        cluster,
        pullSecret,
        managedDomains,
        ocpVersions,
        urlSearchParams: search,
        addCustomManifests: clusterWizardContext.customManifestsStep,
      }),
    [
      infraEnv,
      cluster,
      pullSecret,
      managedDomains,
      ocpVersions,
      search,
      clusterWizardContext.customManifestsStep,
    ],
  );

  const { t } = useTranslation();
  const validationSchema = getClusterDetailsValidationSchema({
    usedClusterNames,
    pullSecretSet: cluster?.pullSecretSet,
    ocpVersions,
    isOcm: true,
    t,
    newFeatureSupportLevels: featureSupportLevels,
  });

  return (
    <Formik
      initialValues={initialValues}
      validate={(values) => {
        clearAlerts();
        return getRichTextValidation(validationSchema)(values);
      }}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, isValid, dirty, errors, touched }) => {
        const errorFields = getFormikErrorFields(errors, touched);
        const footer = (
          <ClusterWizardFooter
            cluster={cluster}
            errorFields={errorFields}
            isSubmitting={isSubmitting}
            isNextDisabled={
              !(
                !isSubmitting &&
                isValid &&
                (dirty || (cluster && canNextClusterDetails({ cluster })))
              )
            }
            onNext={handleOnNext(dirty, submitForm, cluster)}
          />
        );

        return (
          <ClusterWizardStep navigation={navigation} footer={footer}>
            <Grid hasGutter>
              <GridItem>
                <ClusterWizardStepHeader>Cluster details</ClusterWizardStepHeader>
              </GridItem>
              <GridItem span={12} lg={10} xl={9} xl2={7}>
                <OcmClusterDetailsFormFields
                  versions={ocpVersions}
                  forceOpenshiftVersion={cluster?.openshiftVersion}
                  isPullSecretSet={!!cluster?.pullSecretSet}
                  defaultPullSecret={pullSecret}
                  isOcm={isInOcm}
                  managedDomains={managedDomains}
                  clusterExists={!!cluster}
                  clusterCpuArchitecture={cluster?.cpuArchitecture as CpuArchitecture}
                  clusterId={cluster?.id}
                />
              </GridItem>
            </Grid>
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

export default ClusterDetailsForm;
