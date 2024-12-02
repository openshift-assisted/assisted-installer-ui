import type React from 'react';
import { Brand } from '@patternfly/react-core';
import { PageHeader, PageHeaderTools } from '@patternfly/react-core/deprecated';
import { AboutButton } from './AboutButton';
import { FeedbackButton } from './FeedbackButton';

export const Header: React.FC = () => (
  <PageHeader
    logo={
      <Brand
        src="/logo.svg"
        alt="OpenShift Container Platform Assisted Installer"
        style={{ width: '188px' }}
      >
        <source src="/logo.svg" />
      </Brand>
    }
    logoProps={{ href: '/' }}
    headerTools={
      <PageHeaderTools>
        <FeedbackButton />
        <AboutButton />
      </PageHeaderTools>
    }
  />
);
