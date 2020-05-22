import React from 'react';
import {
  PageSidebar,
  Nav,
  NavList,
  NavItem,
  // WizardNav,
  // WizardNavItem,
} from '@patternfly/react-core';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const nav = (
    <Nav aria-label="Cluster deployment wizard steps">
      <NavList>
        <NavItem key="nav-login" id="nav-login" isActive={pathname === '/'}>
          <Link to="/login">Login</Link>
        </NavItem>
        <NavItem key="nav-clusters" id="nav-login" isActive={pathname.includes('/clusters')}>
          <Link to="/clusters">Clusters</Link>
        </NavItem>
      </NavList>
    </Nav>
  );

  // const nav = (
  //   <WizardNav returnList>
  //     <WizardNavItem
  //       text="Cluster Setup"
  //       isCurrent={currentStep === WizardStep.ClusterSetup}
  //       step={WizardStep.ClusterSetup}
  //     />
  //     <WizardNavItem
  //       text="Add Hosts"
  //       isCurrent={currentStep === WizardStep.AddHosts}
  //       step={WizardStep.AddHosts}
  //     />
  //     <WizardNavItem
  //       text="Results"
  //       isCurrent={currentStep === WizardStep.Results}
  //       step={WizardStep.Results}
  //     />
  //   </WizardNav>
  // );
  return <PageSidebar nav={nav} />;
};

export default Sidebar;
