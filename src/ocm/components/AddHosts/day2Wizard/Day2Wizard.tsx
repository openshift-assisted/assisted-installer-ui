import React from 'react';
import { Modal, ModalVariant, WizardHeader } from '@patternfly/react-core';
import classNames from 'classnames';
import { ClusterWizardStep, WizardFooter } from '../../../../common';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { Day2WizardStepsType } from './constants';
import Day2ClusterDetails from './Day2ClusterDetails';
import Day2DownloadISO from './Day2DownloadISO';
import Day2GenerateISO from './Day2GenerateISO';
import Day2StaticIP from './Day2StaticIP';
import Day2WizardNav from './Day2WizardNav';
import { Day2WizardContextType, useDay2WizardContext } from './Day2WizardContext';

// TODO(jgyselov): remove wizardContext
const getCurrentStep = (step: Day2WizardStepsType, wizardContext: Day2WizardContextType) => {
  switch (step) {
    case 'cluster-details':
      return <Day2ClusterDetails />;
    case 'generate-iso':
      return <Day2GenerateISO />;
    case 'download-iso':
      return <Day2DownloadISO />;
    case 'static-ip-network-wide-configurations':
    case 'static-ip-host-configurations':
    case 'static-ip-yaml-view':
      return <Day2StaticIP />;
    default:
      return (
        <ClusterWizardStep
          navigation={<Day2WizardNav />}
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
          Step {step}
        </ClusterWizardStep>
      );
  }
};

const Day2Wizard = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const { isOpen, close } = day2DiscoveryImageDialog;
  const wizardContext = useDay2WizardContext();

  return (
    <Modal isOpen={isOpen} variant={ModalVariant.large} showClose={false} hasNoBodyWrapper>
      <div className={classNames('pf-c-wizard', 'cluster-wizard')}>
        <WizardHeader
          title={'Add hosts'}
          description={'Choose the settings for adding a new host'}
          onClose={close}
        />
        {getCurrentStep(wizardContext.currentStepId, wizardContext)}
      </div>
    </Modal>
  );
};

export default Day2Wizard;
