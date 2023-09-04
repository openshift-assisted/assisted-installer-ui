import type React from 'react';
import { Brand, PageHeader, PageHeaderTools } from '@patternfly/react-core';
import redhatLogo from '/logo.svg';
import { AboutButton } from './AboutButton';
import { FeedbackButton } from './FeedbackButton';

const Header: React.FC = () => {
  return (
    <PageHeader
      logo={
        <Brand
          src={redhatLogo}
          alt={'OpenShift Container Platform Assisted Installer'}
          style={{ width: '188px' }}
        >
          <source src={redhatLogo} />
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
};

export default Header;
