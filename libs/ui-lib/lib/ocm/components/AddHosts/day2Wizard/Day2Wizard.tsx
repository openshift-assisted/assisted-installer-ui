import React from 'react';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import { WizardHeader } from '@patternfly/react-core';
import classNames from 'classnames';
import { ClusterWizardStep } from '../../../../common';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import Day2ClusterDetails from './Day2ClusterDetails';
import Day2DownloadISO from './Day2DownloadISO';
import Day2GenerateISO from './Day2GenerateISO';
import Day2StaticIP from './Day2StaticIP';
import Day2WizardNav from './Day2WizardNav';
import { useDay2WizardContext } from './Day2WizardContext';

const Day2WizardStep = () => {
  const wizardContext = useDay2WizardContext();
  const step = wizardContext.currentStepId;

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
      return <ClusterWizardStep navigation={<Day2WizardNav />}>Step {step}</ClusterWizardStep>;
  }
};

const Day2Wizard = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const { isOpen, close } = day2DiscoveryImageDialog;

  return (
    <Modal
      aria-label={'Day 2 Wizard'}
      isOpen={isOpen}
      variant={ModalVariant.large}
      showClose={false}
      hasNoBodyWrapper
      id="generate-discovery-iso-modal"
    >
      <div className={classNames('pf-v6-c-wizard', 'cluster-wizard')}>
        <WizardHeader
          title={'Add hosts'}
          description={'Choose the settings for adding a new host'}
          onClose={close}
        />
        <Day2WizardStep />
      </div>
    </Modal>
  );
};

export default Day2Wizard;
