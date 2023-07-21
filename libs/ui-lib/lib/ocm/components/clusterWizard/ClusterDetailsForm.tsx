import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Grid, GridItem } from '@patternfly/react-core';
import isUndefined from 'lodash-es/isUndefined.js';
import { Formik, FormikHelpers } from 'formik';
import {
  Cluster,
  ClusterCreateParams,
  ManagedDomain,
  ClusterWizardStep,
  ClusterWizardStepHeader,
  getClusterDetailsValidationSchema,
  InfraEnv,
  getRichTextValidation,
  CpuArchitecture,
} from '../../../common';
import { canNextClusterDetails } from './wizardTransition';
import { OpenshiftVersionOptionType, getFormikErrorFields } from '../../../common';
import ClusterWizardFooter from './ClusterWizardFooter';
import { isInOcm } from '../../api';
import {
  ClusterDetailsService,
  ClusterDetailsUpdateParams,
  OcmClusterDetailsValues,
} from '../../services';
import { OcmClusterDetailsFormFields } from '../clusterConfiguration/OcmClusterDetailsFormFields';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { selectCurrentClusterPermissionsState } from '../../selectors';
import { useClusterWizardContext } from './ClusterWizardContext';
import { useNewFeatureSupportLevel } from '../../../common/components/newFeatureSupportLevels';

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
  ) => Promise<void>;
  handleCustomManifestsChange: (
    clusterId: Cluster['id'],
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
    handleCustomManifestsChange,
    navigation,
  } = props;

  const clusterWizardContext = useClusterWizardContext();
  const { search } = useLocation();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const featureSupportLevels = useNewFeatureSupportLevel();

  const handleSubmit = React.useCallback(
    async (values: OcmClusterDetailsValues) => {
      if (cluster) {
        const platform = values.platform === 'none' ? 'baremetal' : values.platform;
        const resetPlatform = cluster.userManagedNetworking ? 'baremetal' : platform;

        const params = ClusterDetailsService.getClusterUpdateParams(values, resetPlatform);
        await handleClusterUpdate(cluster.id, params);
        await handleCustomManifestsChange(cluster.id, clusterWizardContext.addCustomManifests);
      } else {
        const params = ClusterDetailsService.getClusterCreateParams(values);
        await handleClusterCreate(params, clusterWizardContext.addCustomManifests);
      }
    },
    [
      cluster,
      handleClusterCreate,
      handleClusterUpdate,
      handleCustomManifestsChange,
      clusterWizardContext.addCustomManifests,
    ],
  );

  const handleOnNext = React.useCallback(
    (
      dirty: boolean,
      submitForm: FormikHelpers<unknown>['submitForm'],
      cluster?: Cluster,
    ): (() => void) => {
      if (isViewerMode || (!dirty && !isUndefined(cluster) && canNextClusterDetails({ cluster }))) {
        return moveNext;
      }

      return () => {
        void submitForm();
      };
    },
    [isViewerMode, moveNext],
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
      }),
    [infraEnv, cluster, pullSecret, managedDomains, ocpVersions, search],
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
      validate={getRichTextValidation(validationSchema)}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, isValid, dirty, setFieldValue, errors, touched }) => {
        const errorFields = getFormikErrorFields(errors, touched);
        const toggleRedHatDnsService = (checked: boolean) =>
          setFieldValue('baseDnsDomain', checked ? managedDomains.map((d) => d.domain)[0] : '');

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
                  toggleRedHatDnsService={toggleRedHatDnsService}
                  versions={ocpVersions}
                  forceOpenshiftVersion={cluster?.openshiftVersion}
                  isPullSecretSet={!!cluster?.pullSecretSet}
                  defaultPullSecret={pullSecret}
                  isOcm={isInOcm}
                  managedDomains={managedDomains}
                  clusterExists={!!cluster}
                  clusterCpuArchitecture={cluster?.cpuArchitecture as CpuArchitecture}
                  clusterId={cluster?.id}
                  clusterPlatform={cluster?.platform?.type}
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
