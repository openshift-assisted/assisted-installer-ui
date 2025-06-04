import type React from 'react';
import { Brand, Masthead, MastheadLogo, MastheadMain, MastheadBrand } from '@patternfly/react-core';
import { AboutButton } from './AboutButton';
import { FeedbackButton } from './FeedbackButton';

export const Header: React.FC = () => (
  <Masthead style={{ display: 'flex', justifyContent: 'space-between' }}>
    <MastheadBrand ><MastheadLogo >
      <Brand
        src="/logo.svg"
        alt="OpenShift Container Platform Assisted Installer"
        style={{ width: '188px' }}
      >
        <source src="/logo.svg" />
      </Brand>
    </MastheadLogo></MastheadBrand>
    <MastheadMain>
      <FeedbackButton />
      <AboutButton />
    </MastheadMain>
  </Masthead>
);
