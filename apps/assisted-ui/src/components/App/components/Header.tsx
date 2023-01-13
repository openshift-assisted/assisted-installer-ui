import React from 'react';
import { Constants } from 'openshift-assisted-ui-lib/ocm';
import { Brand, PageHeader, PageHeaderTools, Button, ButtonVariant } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import upstreamLogo from '../../../images/metal3_facet-whitetext.png';
import redhatLogo from '../../../images/Logo-Red_Hat-OpenShift_Container_Platform-B-Reverse-RGB.png';
import AboutModalButton from './AboutModal.js';

const { getProductBrandingCode, FEEDBACK_FORM_LINK } = Constants;

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

const Header = () => {
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
    />
  );
};

export default Header;
