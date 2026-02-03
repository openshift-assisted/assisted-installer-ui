import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom-v5-compat';
import { Flex, Grid, GridItem } from '@patternfly/react-core';
import isUndefined from 'lodash-es/isUndefined.js';
import { Formik, FormikHelpers } from 'formik';
import {
  ClusterWizardStep,
  ClusterWizardStepHeader,
  getClusterDetailsValidationSchema,
  getRichTextValidation,
  useAlerts,
  TechnologyPreview,
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
import {
  Cluster,
  ClusterCreateParams,
  InfraEnv,
  ManagedDomain,
} from '@openshift-assisted/types/assisted-installer-service';
import { useFeature } from '../../hooks/use-feature';
import InstallDisconnectedSwitch from './disconnected/InstallDisconnectedSwitch';

type ClusterDetailsFormProps = {
  cluster?: Cluster;
  infraEnv?: InfraEnv;
  pullSecret: string;
  managedDomains: ManagedDomain[];
  ocpVersions: OpenshiftVersionOptionType[];
  usedClusterNames: string[];
  navigation: React.ReactNode;
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
    handleClusterUpdate,
    handleClusterCreate,
    navigation,
  } = props;

  const { customManifestsStep, moveNext } = useClusterWizardContext();
  const { search } = useLocation();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const { clearAlerts } = useAlerts();
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');

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
        addCustomManifests: customManifestsStep,
      }),
    [infraEnv, cluster, pullSecret, managedDomains, ocpVersions, search, customManifestsStep],
  );

  const { t } = useTranslation();
  const validationSchema = getClusterDetailsValidationSchema({
    usedClusterNames,
    pullSecretSet: cluster?.pullSecretSet,
    isOcm: true,
    t,
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
              {!isSingleClusterFeatureEnabled && (
                <GridItem>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                    <TechnologyPreview />
                    <InstallDisconnectedSwitch isDisabled={!!cluster} />
                    <span>
                      {t("ai:I'm installing on a disconnected/air-gapped/secured environment")}
                    </span>
                  </Flex>
                </GridItem>
              )}
              <GridItem span={12} lg={10} xl={9} xl2={7}>
                <OcmClusterDetailsFormFields
                  versions={ocpVersions}
                  defaultPullSecret={pullSecret}
                  isOcm={isInOcm}
                  managedDomains={managedDomains}
                  cluster={cluster}
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
