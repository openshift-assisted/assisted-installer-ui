import type React from 'react';
import {
  Brand,
  Masthead,
  MastheadBrand,
  MastheadContent,
  Toolbar,
  ToolbarItem,
} from '@patternfly/react-core';
import { AboutButton } from './AboutButton';
import { FeedbackButton } from './FeedbackButton';
import { Link } from 'react-router-dom-v5-compat';

export const Header: React.FC = () => (
  <Masthead>
    <MastheadBrand>
      <Link to="/">
        <Brand
          src="/logo.svg"
          alt="OpenShift Container Platform Assisted Installer"
          style={{ width: '188px' }}
        >
          <source src="/logo.svg" />
        </Brand>
      </Link>
    </MastheadBrand>
    <MastheadContent>
      <Toolbar>
        <ToolbarItem>
          <FeedbackButton />
        </ToolbarItem>
        <ToolbarItem>
          <AboutButton />
        </ToolbarItem>
      </Toolbar>
    </MastheadContent>
  </Masthead>
);
