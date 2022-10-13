import {
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
  WizardHeader,
  WizardNav,
} from '@patternfly/react-core';
import classNames from 'classnames';
import { Form, Formik } from 'formik';
import React from 'react';
import {
  Cluster,
  ClusterWizardStep,
  ClusterWizardStepHeader,
  ToolbarButton,
  WizardFooter,
  WizardNavItem,
} from '../../../../common';
import DiskEncryptionControlGroup from '../../../../common/components/clusterConfiguration/DiskEncryptionFields/DiskEncryptionControlGroup';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { day2WizardStepNames, Day2WizardStepsType } from './constants';
import { useDay2WizardContext } from './Day2WizardContext';

export const Day2DiscoveryImageModalButton = ({
  ButtonComponent = Button,
  cluster,
  idPrefix,
}: {
  ButtonComponent: typeof Button | typeof ToolbarButton;
  cluster: Cluster;
  idPrefix: string;
}) => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const { open } = day2DiscoveryImageDialog;

  return (
    <ButtonComponent
      variant={ButtonVariant.secondary}
      onClick={() => open({ cluster })}
      id={`${idPrefix}-button-download-discovery-iso`}
    >
      Add hosts
    </ButtonComponent>
  );
};

const Day2ClusterDetails = () => {
  return (
    <>
      <Formik
        initialValues={{
          enableDiskEncryptionOnMasters: false,
          enableDiskEncryptionOnWorkers: false,
          diskEncryptionMode: undefined,
          diskEncryptionTangServers: [],
          diskEncryption: undefined,
        }}
        onSubmit={(values) => console.log(values)}
      >
        {({ values }) => {
          return (
            <>
              <Form id="day2-wizard-cluster-details__form">
                <ClusterWizardStepHeader>Cluster details</ClusterWizardStepHeader>
                {/* <ArmCheckbox versions={versions} /> */}
                {/* <HostsNetworkConfigurationControlGroup clusterExists={false} /> */}
                <DiskEncryptionControlGroup values={values} isSNO={false} />
              </Form>
            </>
          );
        }}
      </Formik>
    </>
  );
};

const getCurrentStep = (step: Day2WizardStepsType) => {
  switch (step) {
    case 'cluster-details':
      return <Day2ClusterDetails />;
    default:
      return <>Step {step}</>;
  }
};

export const Day2Wizard = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const { isOpen, close } = day2DiscoveryImageDialog;
  const wizardContext = useDay2WizardContext();

  const isStepIdxAfterCurrent = (idx: number) => {
    return !wizardContext.wizardStepIds.slice(idx).includes(wizardContext.currentStepId);
  };

  const isStepDisabled = (idx: number, stepId: Day2WizardStepsType) => {
    return stepId === 'cluster-details' ? false : isStepIdxAfterCurrent(idx);
  };

  console.log(wizardContext);

  return (
    <Modal isOpen={isOpen} variant={ModalVariant.large} showClose={false} hasNoBodyWrapper>
      <div className={classNames('pf-c-wizard', 'cluster-wizard')}>
        <WizardHeader
          title={'Add hosts'}
          description={'Choose the settings for adding a new host'}
          onClose={close}
        />
        <ClusterWizardStep
          navigation={
            <WizardNav>
              {wizardContext.wizardStepIds.map((step, index) => (
                <WizardNavItem
                  key={index}
                  step={index}
                  content={day2WizardStepNames[step]}
                  isCurrent={wizardContext.currentStepId === step}
                  isDisabled={isStepDisabled(index, step)}
                  onNavItemClick={() => wizardContext.setCurrentStepId(step)}
                />
              ))}
            </WizardNav>
          }
          footer={
            <WizardFooter
              onNext={() => wizardContext.moveNext()}
              onBack={() => wizardContext.moveBack()}
              isBackDisabled={wizardContext.currentStepId === 'cluster-details'}
              isNextDisabled={wizardContext.currentStepId === 'download-iso'}
              onCancel={close}
            />
          }
        >
          {getCurrentStep(wizardContext.currentStepId)}
        </ClusterWizardStep>
      </div>
    </Modal>
  );
};
