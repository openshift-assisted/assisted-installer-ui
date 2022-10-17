import { Button, ButtonVariant, Modal, ModalVariant, WizardHeader } from '@patternfly/react-core';
import classNames from 'classnames';
import React from 'react';
import { Cluster, ClusterWizardStep, ToolbarButton, WizardFooter } from '../../../../common';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { Day2WizardStepsType } from './constants';
import { Day2ClusterDetails } from './Day2ClusterDetails';
import { Day2DownloadISO } from './Day2DownloadISO';
import { Day2GenerateISO } from './Day2GenerateISO';
import { Day2WizardContextType, useDay2WizardContext } from './Day2WizardContext';
import { Day2WizardNav } from './Day2WizardNav';

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

// TODO(jgyselov): remove wizardContext
const getCurrentStep = (step: Day2WizardStepsType, wizardContext: Day2WizardContextType) => {
  switch (step) {
    case 'cluster-details':
      return <Day2ClusterDetails />;
    case 'generate-iso':
      return <Day2GenerateISO />;
    case 'download-iso':
      return <Day2DownloadISO />;
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

export const Day2Wizard = () => {
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
