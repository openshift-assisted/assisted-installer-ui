import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Grid, GridItem } from '@patternfly/react-core';
import isUndefined from 'lodash/isUndefined';
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
  useFeatureSupportLevel,
} from '../../../common';
import { canNextClusterDetails } from './wizardTransition';
import { OpenshiftVersionOptionType, getFormikErrorFields } from '../../../common';
import ClusterWizardFooter from './ClusterWizardFooter';
import { ocmClient } from '../../api';
import {
  ClusterDetailsService,
  ClusterDetailsUpdateParams,
  OcmClusterDetailsValues,
} from '../../services';
import { OcmClusterDetailsFormFields } from '../clusterConfiguration/OcmClusterDetailsFormFields';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { selectCurrentClusterPermissionsState } from '../../selectors';

type ClusterDetailsFormProps = {
  cluster?: Cluster;
  infraEnv?: InfraEnv;
  pullSecret: string;
  managedDomains: ManagedDomain[];
  ocpVersions: OpenshiftVersionOptionType[];
  usedClusterNames: string[];
  navigation: React.ReactNode;
  moveNext: () => void;
  handleClusterCreate: (params: ClusterCreateParams) => Promise<void>;
  handleClusterUpdate: (
    clusterId: Cluster['id'],
    params: ClusterDetailsUpdateParams,
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

  const { search } = useLocation();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const featureSupportLevels = useFeatureSupportLevel();
  const handleSubmit = React.useCallback(
    async (values: OcmClusterDetailsValues) => {
      if (cluster) {
        const params = ClusterDetailsService.getClusterUpdateParams(values);
        await handleClusterUpdate(cluster.id, params);
      } else {
        const params = ClusterDetailsService.getClusterCreateParams(values);
        await handleClusterCreate(params);
      }
    },
    [cluster, handleClusterCreate, handleClusterUpdate],
  );

  const handleOnNext = (
    dirty: boolean,
    submitForm: FormikHelpers<unknown>['submitForm'],
    cluster?: Cluster,
  ): (() => Promise<void> | void) => {
    if (isViewerMode || (!dirty && !isUndefined(cluster) && canNextClusterDetails({ cluster }))) {
      return moveNext;
    }
    return submitForm;
  };

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
    featureSupportLevels,
    pullSecretSet: cluster?.pullSecretSet,
    ocpVersions,
    isOcm: true,
    t,
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

        const form = (
          <>
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
                  isOcm={!!ocmClient}
                  managedDomains={managedDomains}
                  clusterExists={!!cluster}
                  clusterCpuArchitecture={cluster?.cpuArchitecture}
                />
              </GridItem>
            </Grid>
          </>
        );

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
            {form}
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

export default ClusterDetailsForm;
