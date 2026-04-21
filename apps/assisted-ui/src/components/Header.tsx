import type React from 'react';
import { Brand, Masthead, MastheadLogo, MastheadMain, MastheadBrand } from '@patternfly/react-core';
import { Link } from 'react-router-dom-v5-compat';
import { Config } from '@openshift-assisted/ui-lib/ocm';
import { AboutButton } from './AboutButton';
import { FeedbackButton } from './FeedbackButton';

const clustersListPath = `${Config.routeBasePath}/clusters`;

export const Header: React.FC = () => (
  <Masthead style={{ display: 'flex', justifyContent: 'space-between' }}>
    <MastheadBrand>
      <MastheadLogo component={(props) => <Link {...props} to={clustersListPath} />}>
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
