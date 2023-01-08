import React from 'react';
import { Brand, PageHeader, PageHeaderTools, Button, ButtonVariant } from '@patternfly/react-core';
import * as OCM from 'openshift-assisted-ui-lib/ocm';
import upstreamLogo from './images/metal3_facet-whitetext.png';
import redhatLogo from './images/Logo-Red_Hat-OpenShift_Container_Platform-B-Reverse-RGB.png';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import AboutModalButton from './AboutModal';

const { getProductBrandingCode, FEEDBACK_FORM_LINK } = OCM.Constants;

const getBrandingDetails = () => {
  switch (getProductBrandingCode()) {
    case 'redhat':
      return {
        logo: redhatLogo,
        alt: 'OpenShift Container Platform Assisted Installer',
        href: '/', // let's go to Clusters List
      };
    default:
      return {
        logo: upstreamLogo,
        alt: 'Assisted Installer UI',
        href: 'https://github.com/openshift-assisted/assisted-ui',
      };
  }
};

const Header: React.FC = () => {
  const branding = getBrandingDetails();
  const logoProps = { href: branding.href };
  return (
    <PageHeader
      logo={<Brand src={branding.logo} alt={branding.alt} />}
      logoProps={logoProps}
      headerTools={
        <PageHeaderTools>
          <Button
            variant={ButtonVariant.plain}
            onClick={() => window.open(FEEDBACK_FORM_LINK, '_blank', 'noopener noreferrer')}
            id="button-feedback"
          >
            Provide feedback <ExternalLinkAltIcon />
          </Button>
          <AboutModalButton />
        </PageHeaderTools>
      }
      // toolbar={PageToolbar}
      //avatar={<Avatar src={avatarImg} alt="Avatar image" />}
      // showNavToggle
      // onNavToggle={this.onNavToggle}
    />
  );
};

export default Header;
