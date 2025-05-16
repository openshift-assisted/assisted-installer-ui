import type React from 'react';
import { Brand, Masthead, MastheadBrand, MastheadMain } from '@patternfly/react-core';
import { AboutButton } from './AboutButton';
import { FeedbackButton } from './FeedbackButton';

export const Header: React.FC = () => (
  <Masthead style={{ display: 'flex', justifyContent: 'space-between' }}>
    <MastheadBrand>
      <Brand
        src="/logo.svg"
        alt="OpenShift Container Platform Assisted Installer"
        style={{ width: '188px' }}
      >
        <source src="/logo.svg" />
      </Brand>
    </MastheadBrand>
    <MastheadMain>
      <FeedbackButton />
      <AboutButton />
    </MastheadMain>
  </Masthead>
);
