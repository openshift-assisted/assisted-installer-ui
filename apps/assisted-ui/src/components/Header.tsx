import type React from 'react';
import { Brand, Masthead, MastheadLogo, MastheadMain, MastheadBrand } from '@patternfly/react-core';
import { Link } from 'react-router';
import { AboutButton } from './AboutButton';
import { FeedbackButton } from './FeedbackButton';

export const Header: React.FC = () => (
  <Masthead style={{ display: 'flex', justifyContent: 'space-between' }}>
    <MastheadBrand>
      <MastheadLogo component={(props) => <Link {...props} to={'..'} />}>
        <Brand
          src="/logo.svg"
          alt="OpenShift Container Platform Assisted Installer"
          style={{ width: '188px' }}
        >
          <source src="/logo.svg" />
        </Brand>
      </MastheadLogo>
    </MastheadBrand>
    <MastheadMain>
      <FeedbackButton />
      <AboutButton />
    </MastheadMain>
  </Masthead>
);
